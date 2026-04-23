const { body, query } = require("express-validator");
const mongoose = require("mongoose");

const normalizePhoneNumber = require("../utils/normalizePhoneNumber");

const createContactValidator = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters."),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .custom((value, { req }) => {
      const normalized = normalizePhoneNumber(value, req.body.countryCode);

      if (normalized.length < 10 || normalized.length > 15) {
        throw new Error("Please provide a valid phone number.");
      }

      return true;
    }),
  body("countryCode")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{1,4}$/)
    .withMessage("Country code must contain 1 to 4 digits."),
  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be at most 500 characters."),
  body("tags")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Tags must be an array with up to 10 items."),
  body("tags.*")
    .optional()
    .isString()
    .withMessage("Each tag must be a string.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters."),
];

const contactListValidator = [
  query("search")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search must be at most 100 characters."),
  query("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("ownerId")
    .optional({ checkFalsy: true })
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Owner ID must be a valid MongoDB ObjectId."),
];

module.exports = {
  contactListValidator,
  createContactValidator,
};
