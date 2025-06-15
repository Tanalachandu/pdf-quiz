import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const router = express.Router();

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

const upload = multer({ storage: multer.memoryStorage() });

const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const extension = file.originalname.split(".").pop();

      let text = "";

      if (extension === "pdf") {
        const data = await pdfParse(file.buffer);
        text = data.text;
      } else if (extension === "docx") {
        const data = await mammoth.extractRawText({ buffer: file.buffer });
        text = data.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      return res.json({ text });
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse PDF" });
    }
  })
);

export default router;
