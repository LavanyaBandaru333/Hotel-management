import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import diningRoutes from "./routes/diningRoutes.js";
import spaRoutes from "./routes/spaRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only for local/dev when no environment-provided vars exist
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const start = async () => {
  const rawEnv = process.env.RENDER_MONGO_URI || process.env.MONGO_URI || '';
  let MONGO_URI = rawEnv && rawEnv.trim().length > 0 ? rawEnv.trim() : undefined;

  try {
    if (MONGO_URI && (MONGO_URI.startsWith("mongodb://") || MONGO_URI.startsWith("mongodb+srv://"))) {
      try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
        console.log("✅ Primary MongoDB Connected");
      } catch (primaryErr) {
        console.warn("⚠️ Primary MongoDB connection failed. Falling back to in-memory MongoDB server...", primaryErr.message);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        MONGO_URI = mongod.getUri();
        await mongoose.connect(MONGO_URI);
        console.log("✅ In-Memory MongoDB Started & Connected");
      }
    } else {
      console.warn("⚠️ No MONGO_URI specified. Starting in-memory MongoDB server...");
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      MONGO_URI = mongod.getUri();
      await mongoose.connect(MONGO_URI);
      console.log("✅ In-Memory MongoDB Started & Connected");
    }

    // register routes after DB is connected
    app.use("/api/rooms", roomRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/dining", diningRoutes);
    app.use("/api/spa", spaRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/auth", authRoutes);

    app.get("/", (req, res) => res.send("Hotel API is running!"));
    app.get("/api", (req, res) => res.send("Hotel API is running!"));

    // Global JSON error handling middleware
    app.use((err, req, res, next) => {
      console.error("Server Error:", err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  }
};

start();
