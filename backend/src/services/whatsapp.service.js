const crypto = require("crypto");

const env = require("../config/env");
const ApiError = require("../utils/apiError");
const normalizePhoneNumber = require("../utils/normalizePhoneNumber");

function normalizeWhatsappAddress(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (trimmedValue.startsWith("whatsapp:")) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("+")) {
    return `whatsapp:${trimmedValue}`;
  }

  const digitsOnly = trimmedValue.replace(/\D/g, "");

  return digitsOnly ? `whatsapp:+${digitsOnly}` : "";
}

async function sendViaTwilio({ to, message }) {
  if (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioWhatsappFrom) {
    throw new ApiError(
      500,
      "Twilio credentials are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.",
    );
  }

  if (message.length > 1600) {
    throw new ApiError(
      400,
      "Twilio WhatsApp sandbox messages must be 1600 characters or fewer.",
    );
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`;
  const requestBody = new URLSearchParams({
    From: normalizeWhatsappAddress(env.twilioWhatsappFrom),
    To: normalizeWhatsappAddress(`+${to}`),
    Body: message,
  });

  if (env.twilioStatusCallbackUrl) {
    requestBody.set("StatusCallback", env.twilioStatusCallbackUrl);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${env.twilioAccountSid}:${env.twilioAuthToken}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody.toString(),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new ApiError(
        response.status,
        payload?.message || "Twilio WhatsApp API request failed.",
      );
      error.metaResponse = payload;
      throw error;
    }

    return {
      provider: "twilio",
      mode: "live",
      messageId: payload?.sid || crypto.randomUUID(),
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

async function sendViaMeta({ to, message }) {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    throw new ApiError(
      500,
      "Meta WhatsApp credentials are missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    );
  }

  const endpoint = `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new ApiError(
        response.status,
        payload?.error?.message || "Meta WhatsApp API request failed.",
      );
      error.metaResponse = payload;
      throw error;
    }

    return {
      provider: "meta",
      mode: "live",
      messageId: payload?.messages?.[0]?.id || crypto.randomUUID(),
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
  const trimmedMessage = String(message || "").trim();

  if (!normalizedPhoneNumber) {
    throw new ApiError(400, "A valid recipient phone number is required.");
  }

  if (!trimmedMessage) {
    throw new ApiError(400, "Message content cannot be empty.");
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

  if (env.whatsappProvider === "twilio") {
    return sendViaTwilio({
      to: normalizedPhoneNumber,
      message: trimmedMessage,
    });
  }

  if (env.whatsappProvider === "meta") {
    return sendViaMeta({
      to: normalizedPhoneNumber,
      message: trimmedMessage,
    });
  }

  throw new ApiError(
    500,
    "Unsupported WhatsApp provider configured. Use WHATSAPP_PROVIDER=meta or WHATSAPP_PROVIDER=twilio.",
  );
}

module.exports = {
  sendTextMessage,
};
