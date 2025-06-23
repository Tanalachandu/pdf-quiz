import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

router.post("/", async (req, res) => {
  const data = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`
You are an AI that generates quiz questions based on the given content.

Generate exactly ${data.count} ${data.type.toUpperCase()} questions at ${data.level.toUpperCase()} difficulty level from the following content:

${data.content}

${data.custom ? `Additional user instruction: ${data.custom}` : ""}

Return your response as a **valid JSON array** containing exactly ${data.count} objects.

Each object must have the following keys:
- "question": string (the quiz question)
- "options": string[] (exactly 4 distinct options)
- "answer": string (must match one of the options)

Strictly return only the JSON array. Do not include explanations, comments, markdown, or any additional text. Ensure all strings are properly quoted.
    `);

    const raw = await result.response.text();
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json({ questions: parsed });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

export default router;
