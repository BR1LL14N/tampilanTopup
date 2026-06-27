const express = require("express");
const cors = require("cors");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const AUTH_DIR = path.join(__dirname, "auth_info_baileys");

let sock = null;
let qrCodeImage = null; // Stores current QR code as DataURL (Base64)
let connectionStatus = "disconnected"; // Status: disconnected, qr, connecting, connected

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: ["Mitsuru Top Up", "Chrome", "1.0.0"],
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionStatus = "qr";
      try {
        // Generate QR code as Base64 Image
        qrCodeImage = await QRCode.toDataURL(qr);
        console.log("New QR Code generated. Scan it in your Admin Dashboard.");
      } catch (err) {
        console.error("Failed to generate QR Code image:", err);
      }
    }

    if (connection === "connecting") {
      connectionStatus = "connecting";
      console.log("Connecting to WhatsApp Web...");
    }

    if (connection === "open") {
      connectionStatus = "connected";
      qrCodeImage = null; // Clear QR image since we are connected
      console.log("WhatsApp Web Connection is OPEN / CONNECTED!");
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting: ", shouldReconnect);

      connectionStatus = "disconnected";
      qrCodeImage = null;

      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log("Permanently logged out. Clearing credentials session...");
        // Clear credentials directory
        if (fs.existsSync(AUTH_DIR)) {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        }
        connectToWhatsApp();
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

// 1. Endpoint to check connection status
app.get("/status", (req, res) => {
  res.json({
    status: connectionStatus,
    qr: qrCodeImage, // Will be null if connected
  });
});

// 2. Endpoint to send messages
app.post("/send", async (req, res) => {
  let { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message' field" });
  }

  if (connectionStatus !== "connected" || !sock) {
    return res.status(503).json({ error: "WhatsApp Gateway is not connected yet" });
  }

  try {
    // Format phone number to WhatsApp format (e.g. 628123456789@s.whatsapp.net)
    let formattedNum = to.toString().replace(/[^0-9]/g, ""); // Keep only digits
    if (formattedNum.startsWith("0")) {
      formattedNum = "62" + formattedNum.substring(1); // Replace leading 0 with 62
    }
    
    const jid = `${formattedNum}@s.whatsapp.net`;

    // Send the message
    await sock.sendMessage(jid, { text: message });
    console.log(`Successfully sent message to: ${jid}`);

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err);
    res.status(500).json({ error: "Failed to send message: " + err.message });
  }
});

// 3. Endpoint to manually logout / unlink
app.post("/logout", async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
    connectionStatus = "disconnected";
    qrCodeImage = null;
    res.json({ success: true, message: "Logged out successfully" });
    
    // Restart connection to generate a new QR
    connectToWhatsApp();
  } catch (err) {
    res.status(500).json({ error: "Logout failed: " + err.message });
  }
});

// Start Express Server and Baileys socket connection
app.listen(PORT, () => {
  console.log(`WhatsApp Gateway server is running on port ${PORT}`);
  connectToWhatsApp();
});
