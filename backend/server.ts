import express from "express";
import cors from "cors";
import uploadFile from "./routes/uploadFile";
import generateRouter from "./routes/generate";  // ← import your generate route

const app = express();

// Allow your local frontend to talk, plus any prod domain if needed:
app.use(cors({
  origin: [
    "http://localhost:5174",
    "https://pdf2quiz-chi.vercel.app/"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount your file‑upload route
app.use("/api/upload", uploadFile);

// Mount your quiz‑generation route
app.use("/api/generate", generateRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
