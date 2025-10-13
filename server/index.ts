import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./vite.js";
import { setupVite } from "./vite.js";

// Proper __dirname handling in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

(async () => {
  const server = createServer(app);
  await registerRoutes(app);

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    console.log("🚀 Development mode: Vite middleware active");
    await setupVite(app, server);
  } else {
    console.log("🏗️ Production mode: serving static build...");
    serveStatic(app, path.resolve(__dirname, "../dist/public"));
  }

  const port = Number(process.env.PORT) || 5000;
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`✅ Server running at http://${host}:${port}`);
  });
})();
