const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseList(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInteger(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/whatsapp-crm",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bodyLimit: process.env.BODY_LIMIT || "1mb",
  corsOrigins: parseList(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]),
  allowPublicSignup: process.env.ALLOW_PUBLIC_SIGNUP === "true",
  uploadMaxFileSizeMb: parseInteger(process.env.UPLOAD_MAX_FILE_SIZE_MB, 5),
  bulkSendConcurrency: parseInteger(process.env.BULK_SEND_CONCURRENCY, 5),
  defaultCountryCode: (process.env.DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, ""),
  whatsappApiMode: process.env.WHATSAPP_API_MODE || "mock",
  whatsappProvider: (process.env.WHATSAPP_PROVIDER || "meta").toLowerCase(),
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || "v22.0",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
  twilioStatusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL || "",
  defaultSuperAdminName: process.env.DEFAULT_SUPER_ADMIN_NAME || "Super Admin",
  defaultSuperAdminEmail: (
    process.env.DEFAULT_SUPER_ADMIN_EMAIL || "superadmin@gmail.com"
  )
    .toLowerCase()
    .trim(),
  defaultSuperAdminPassword: process.env.DEFAULT_SUPER_ADMIN_PASSWORD || "superadmin",
};

if (env.nodeEnv === "production" && env.jwtSecret === "change-me-in-production") {
  throw new Error("JWT_SECRET must be configured in production.");
}

module.exports = env;
