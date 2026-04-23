const Contact = require("../models/contact.model");
const ApiError = require("../utils/apiError");
const normalizePhoneNumber = require("../utils/normalizePhoneNumber");

function normalizeTags(tags = []) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
}

async function upsertContactFromPayload({
  ownerId,
  createdBy,
  name,
  phoneNumber,
  countryCode,
  notes,
  tags,
  source = "manual",
}) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, countryCode);

  if (!normalizedPhoneNumber) {
    throw new ApiError(400, "A valid phone number is required.");
  }

  const existingContact = await Contact.findOne({
    owner: ownerId,
    normalizedPhoneNumber,
  });

  if (existingContact) {
    existingContact.name = name || existingContact.name;
    existingContact.phoneNumber = phoneNumber || existingContact.phoneNumber;
    existingContact.countryCode = countryCode || existingContact.countryCode;
    existingContact.notes = notes || existingContact.notes;
    existingContact.source = source || existingContact.source;

    if (Array.isArray(tags)) {
      existingContact.tags = normalizeTags(tags);
    }

    await existingContact.save();
    return existingContact;
  }

  const contact = await Contact.create({
    owner: ownerId,
    createdBy,
    name,
    phoneNumber,
    countryCode,
    notes,
    tags: normalizeTags(tags),
    source,
  });

  return contact;
}

async function markContactAsMessaged(contactId) {
  if (!contactId) {
    return null;
  }

  return Contact.findByIdAndUpdate(
    contactId,
    {
      $inc: { messageCount: 1 },
      $set: { lastMessagedAt: new Date() },
    },
    { new: true },
  );
}

module.exports = {
  markContactAsMessaged,
  upsertContactFromPayload,
};
