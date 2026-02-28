import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runPipeline } from "./lib/pipeline";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);

  // Run immediately on startup, then every 5 seconds
  runPipeline();
  setInterval(runPipeline, 5000);
});

export default app;
