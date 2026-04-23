const mongoose = require("mongoose");

const env = require("../config/env");
const MessageHistory = require("../models/messageHistory.model");
const { parseContactsFile } = require("../services/bulkUpload.service");
const { sendTextMessage } = require("../services/whatsapp.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const promisePool = require("../utils/promisePool");

const sendSingleMessage = asyncHandler(async (req, res) => {
  const targetPhoneNumber = req.body.phoneNumber;
  const recipientName = req.body.name || "";

  const history = await MessageHistory.create({
    owner: req.user._id,
    recipientName,
    phoneNumber: targetPhoneNumber,
    message: req.body.message,
    source: "manual",
    status: "pending",
  });

  try {
    const delivery = await sendTextMessage({
      to: targetPhoneNumber,
      message: req.body.message,
    });

    history.status = "sent";
    history.metaMessageId = delivery.messageId;
    history.metaResponse = delivery.raw;
    history.sentAt = new Date();
    await history.save();

    res.status(200).json({
      success: true,
      message: "WhatsApp message sent successfully.",
      data: {
        history,
        delivery,
      },
    });
  } catch (error) {
    history.status = "failed";
    history.errorMessage = error.message;
    history.metaResponse = error.metaResponse || null;
    await history.save();

    res.status(error.statusCode || 502).json({
      success: false,
      message: "Failed to send WhatsApp message.",
      error: error.message,
      data: {
        history,
      },
    });
  }
});

const sendBulkMessages = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "A CSV or Excel file is required for bulk sending.");
  }

  const parsedFile = await parseContactsFile(req.file);

  if (parsedFile.recipients.length === 0) {
    throw new ApiError(400, "No valid phone numbers were found in the uploaded file.");
  }

  const batchId = new mongoose.Types.ObjectId().toString();
  const results = await promisePool(
    parsedFile.recipients,
    async (recipient) => {
      const history = await MessageHistory.create({
        owner: req.user._id,
        batchId,
        recipientName: recipient.name,
        phoneNumber: recipient.normalizedPhoneNumber,
        message: req.body.message,
        source: "bulk",
        status: "pending",
      });

      try {
        const delivery = await sendTextMessage({
          to: recipient.normalizedPhoneNumber,
          message: req.body.message,
        });

        history.status = "sent";
        history.metaMessageId = delivery.messageId;
        history.metaResponse = delivery.raw;
        history.sentAt = new Date();
        await history.save();

        return {
          rowNumber: recipient.rowNumber,
          recipientName: recipient.name,
          phoneNumber: recipient.normalizedPhoneNumber,
          status: "sent",
          historyId: history._id,
          messageId: delivery.messageId,
        };
      } catch (error) {
        history.status = "failed";
        history.errorMessage = error.message;
        history.metaResponse = error.metaResponse || null;
        await history.save();

        return {
          rowNumber: recipient.rowNumber,
          recipientName: recipient.name,
          phoneNumber: recipient.normalizedPhoneNumber,
          status: "failed",
          historyId: history._id,
          error: error.message,
        };
      }
    },
    env.bulkSendConcurrency,
  );

  const sentCount = results.filter((result) => result.status === "sent").length;
  const failedCount = results.length - sentCount;

  res.status(200).json({
    success: failedCount === 0,
    message: `Bulk WhatsApp processing finished. ${sentCount} sent and ${failedCount} failed.`,
    data: {
      batchId,
      totalRows: parsedFile.totalRows,
      validRecipients: parsedFile.recipients.length,
      invalidRows: parsedFile.invalidRows,
      duplicateRows: parsedFile.duplicateRows,
      sentCount,
      failedCount,
      resultsPreview: results.slice(0, 50),
    },
  });
});

const getMessageHistory = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 20;
  const filter = {};

  if (req.query.cursor) {
    filter._id = { $lt: req.query.cursor };
  }

  const skip = req.query.cursor ? 0 : (page - 1) * limit;

  if (req.user.role === "super_admin" && req.query.ownerId) {
    filter.owner = req.query.ownerId;
  } else if (req.user.role === "admin") {
    filter.owner = req.user._id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.source) {
    filter.source = req.query.source;
  }

  if (req.query.batchId) {
    filter.batchId = req.query.batchId;
  }

  if (req.query.search) {
    filter.$or = [
      { recipientName: { $regex: req.query.search, $options: "i" } },
      { phoneNumber: { $regex: req.query.search, $options: "i" } },
      { message: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [history, total] = await Promise.all([
    MessageHistory.find(filter)
      .populate("owner", "name email role crmAccessId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MessageHistory.countDocuments(filter),
  ]);

  const nextCursor = history.length === limit ? history[history.length - 1]._id : null;

  res.status(200).json({
    success: true,
    message: "Message history fetched successfully.",
    data: {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        nextCursor,
      },
    },
  });
});

const getMessageHistoryById = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.historyId };

  if (req.user.role === "admin") {
    filter.owner = req.user._id;
  }

  const history = await MessageHistory.findOne(filter)
    .populate("owner", "name email role crmAccessId");

  if (!history) {
    throw new ApiError(404, "Message history entry not found.");
  }

  res.status(200).json({
    success: true,
    message: "Message history item fetched successfully.",
    data: {
      history,
    },
  });
});

module.exports = {
  getMessageHistory,
  getMessageHistoryById,
  sendBulkMessages,
  sendSingleMessage,
};
