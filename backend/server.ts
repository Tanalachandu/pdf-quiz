import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadFile from "./routes/uploadFile";
import generateRouter from "./routes/generate";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5174", "https://pdf2quiz-chi.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/upload", uploadFile);
app.use("/api/generate", generateRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);

});
