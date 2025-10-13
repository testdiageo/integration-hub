import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { serveStatic, setupVite } from "./vite.js";

// ✅ Fix __dirname and __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  res.json = function (body, ...args) {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} ${res.statusCode} in ${duration}ms`);
    return originalJson.apply(this, [body, ...args]);
  };
  next();
});

(async () => {
  const server = await registerRoutes(app);

  const env = process.env.NODE_ENV || "production";

  if (env === "development") {
    console.log("🚀 Running in development mode (Vite middleware active)");
    await setupVite(app, server);
  } else {
    console.log("🏗️ Running in production mode (serving static build)");
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";

  server.listen({ port, host }, () => {
    console.log(`🌐 Server running on http://${host}:${port}`);
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log(`🏗️ Railway environment: ${process.env.RAILWAY_ENVIRONMENT}`);
    }
  });
})();
