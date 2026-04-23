const express = require("express");

const authRoutes = require("./auth.routes");
const messageRoutes = require("./message.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM backend is healthy.",
  });
});

router.use("/api/auth", authRoutes);
router.use("/api/messages", messageRoutes);

module.exports = router;
