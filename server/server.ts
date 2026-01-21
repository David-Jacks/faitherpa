import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./src/config/db";
import apiRouter from "./src/route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || "";

// Basic middleware
app.use(helmet());
// Simple CORS policy: allow only the configured Netlify origin and localhost dev
// origins. Set `ALLOWED_ORIGIN` in your environment to override the default.
const allowedOrigins = [allowedOrigin, "http://localhost:5173"];
// console.log(allowedOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) so curl/server-to-server calls work.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(morgan("combined"));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api", apiRouter);

// Serve frontend static files (production build)
// Ensure your frontend build output path is correct relative to the server
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

// SPA fallback: return index.html for any non-API route so client-side routing works
app.get("/*", (req, res, next) => {
  // let API routes 404 normally
  if (req.path.startsWith("/api/") || req.path === "/api") return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "internal_server_error" });
  },
);

// Start server after connecting to DB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server, DB connection error", err);
    process.exit(1);
  });

export default app;
