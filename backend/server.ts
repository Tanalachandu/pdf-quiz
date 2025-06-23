import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadFile from "./routes/uploadFile";
import generateRouter from "./routes/generate";

dotenv.config(); // Load environment variables

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5174",
    "https://pdf2quiz-chi.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.options("*", cors()); // Handle preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/upload", uploadFile);
app.use("/api/generate", generateRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
