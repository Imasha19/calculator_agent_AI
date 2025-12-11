import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent, getBreakdown } from "./agent.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    console.log("Received question:", question);
    const answer = await runAgent(question);
    console.log("Agent answer:", answer);
    res.json({ answer });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/breakdown", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    console.log("Received breakdown request:", question);
    const breakdown = await getBreakdown(question);
    console.log("Breakdown:", breakdown);
    res.json({ breakdown });
  } catch (error) {
    console.error("Breakdown error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
