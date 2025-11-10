import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { serveStatic, setupVite } from "./vite.js";
import { SubscriptionPolicyService } from "./services/subscriptionPolicyService.js";

// ✅ Fix __dirname and __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  res.json = function (body, ...args) {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Only setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    console.log("🏗️ Running in production mode (serving static build)");
    serveStatic(app);
  }

  // Use Railway’s PORT env var (it injects this automatically)
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0"; // must be 0.0.0.0 for Railway

  server.listen(
    { port, host, reusePort: true },
    () => {
      log(`🚀 Server running in ${app.get("env")} mode`);
      log(`🌐 Listening on http://${host}:${port}`);
      if (process.env.RAILWAY_ENVIRONMENT) {
        log(`🏗️  Running on Railway environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      }
    }
  );
})();
