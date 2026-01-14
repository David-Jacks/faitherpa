import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./src/config/db";
import apiRouter from "./src/route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Basic middleware
app.use(helmet());
// Allow requests only from configured origins (Netlify site and localhost dev).
const allowedOrigins = [process.env.ALLOWED_ORIGIN, "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // If no origin is provided (server-to-server or curl), allow by default.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: Origin not allowed"));
    },
  })
);

// Defensive middleware: reject browser requests that include an Origin header
// not present in `allowedOrigins` with a clear 403 JSON response.
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "origin_not_allowed" });
  }
  next();
});
app.use(express.json());
// Avoid logging health-check pings to keep logs clean (Render probes are frequent)
app.use(morgan("dev", { skip: (req, _res) => req.path === "/health" }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api", apiRouter);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "internal_server_error" });
  }
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
