import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";

/* Routes */
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import userRoutes from "./routes/users.js";

const app = express();

/* ── Middleware ── */
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/* ── API Routes ── */
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

/* ── Health check ── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── Error handler (must be last) ── */
app.use(errorHandler);

/* ── Start ── */
async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`\n🚀 ClearTrail server running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}\n`);
  });
}

start();
