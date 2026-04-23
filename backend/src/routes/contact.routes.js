const express = require("express");

const { createContact, listContacts } = require("../controllers/contact.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validateRequest = require("../middlewares/validate.middleware");
const { contactListValidator, createContactValidator } = require("../validators/contact.validators");

const router = express.Router();

router.use(authenticate, authorize("super_admin", "admin"));
router.post("/", createContactValidator, validateRequest, createContact);
router.get("/", contactListValidator, validateRequest, listContacts);

module.exports = router;
