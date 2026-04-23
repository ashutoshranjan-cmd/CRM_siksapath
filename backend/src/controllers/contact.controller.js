const Contact = require("../models/contact.model");
const asyncHandler = require("../utils/asyncHandler");
const { upsertContactFromPayload } = require("../services/contact.service");

const createContact = asyncHandler(async (req, res) => {
  const contact = await upsertContactFromPayload({
    ownerId: req.user._id,
    createdBy: req.user._id,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    countryCode: req.body.countryCode,
    notes: req.body.notes,
    tags: req.body.tags,
    source: "manual",
  });

  res.status(201).json({
    success: true,
    message: "Contact saved successfully.",
    data: {
      contact,
    },
  });
});

const listContacts = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.user.role === "super_admin" && req.query.ownerId) {
    filter.owner = req.query.ownerId;
  } else if (req.user.role === "admin") {
    filter.owner = req.user._id;
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { phoneNumber: { $regex: req.query.search, $options: "i" } },
      { normalizedPhoneNumber: { $regex: req.query.search.replace(/\D/g, ""), $options: "i" } },
    ];
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Contacts fetched successfully.",
    data: {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

module.exports = {
  createContact,
  listContacts,
};
