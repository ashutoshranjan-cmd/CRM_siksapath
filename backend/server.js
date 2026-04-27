const app = require("./src/app");
const env = require("./src/config/env");
const connectDatabase = require("./src/config/database");
const ensureDefaultSuperAdmin = require("./src/services/bootstrap.service");
const { startWhatsappWorker } = require("./src/queues/whatsapp.worker");
const mongoose = require("mongoose");

async function startServer() {
  try {
    await connectDatabase();
    await ensureDefaultSuperAdmin();

    // Start the BullMQ WhatsApp worker so queued messages get processed
    const worker = startWhatsappWorker();

    const server = app.listen(env.port, () => {
      console.log(`CRM backend running on port ${env.port} in ${env.nodeEnv} mode.`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing CRM backend gracefully...`);
      // Close the worker first to finish in-flight jobs
      await worker.close();
      console.log("[WhatsApp Worker] Stopped.");
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start CRM backend:", error.message);
    process.exit(1);
  }
}

startServer();
