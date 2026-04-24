const crypto = require("crypto");

const env = require("../config/env");
const ApiError = require("../utils/apiError");
const normalizePhoneNumber = require("../utils/normalizePhoneNumber");

async function sendViaFast2Sms({ to, message }) {
  if (!env.fast2smsApiKey || !env.fast2smsPhoneNumberId) {
    throw new ApiError(
      500,
      "Fast2SMS credentials are missing. Set FAST2SMS_API_KEY and FAST2SMS_PHONE_NUMBER_ID.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const endpoint = new URL("https://www.fast2sms.com/dev/whatsapp-session");
    endpoint.searchParams.set("phone_number_id", env.fast2smsPhoneNumberId);
    endpoint.searchParams.set("to", to);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: env.fast2smsApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        type: "text",
        text: message,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new ApiError(
        response.status,
        payload?.message || "Fast2SMS WhatsApp API request failed.",
      );
      error.metaResponse = payload;
      throw error;
    }

    return {
      provider: "fast2sms",
      mode: "live",
      messageId:
        payload?.data?.message_id ||
        payload?.message_id ||
        payload?.id ||
        crypto.randomUUID(),
      to,
      raw: payload,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError(504, "Timed out while sending the WhatsApp message.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function sendTextMessage({ to, message }) {
  const normalizedPhoneNumber = normalizePhoneNumber(to);
  const trimmedMessage = String(message || "This is a default message from CRM.").trim();

  if (!normalizedPhoneNumber) {
    throw new ApiError(400, "A valid recipient phone number is required.");
  }

  if (env.whatsappApiMode === "mock") {
    return {
      provider: env.whatsappProvider,
      mode: "mock",
      messageId: `mock-${crypto.randomUUID()}`,
      to: normalizedPhoneNumber,
      raw: {
        messaging_product: "whatsapp",
        contacts: [{ input: normalizedPhoneNumber }],
      },
    };
  }

  if (env.whatsappProvider === "fast2sms") {
    return sendViaFast2Sms({
      to: normalizedPhoneNumber,
      message: trimmedMessage,
    });
  }

  throw new ApiError(
    500,
    "Unsupported WhatsApp provider configured. Use WHATSAPP_PROVIDER=fast2sms.",
  );
}

module.exports = {
  sendTextMessage,
};
