import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import canvasRoutes from "./routes/canvasRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",");
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/canvases", canvasRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;