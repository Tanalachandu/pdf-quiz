// frontend/gemini/config.ts
import axios from "axios";
import type { Data } from "../types/Data";
import type { Question } from "../types/Question";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default async function getQuestions(data: Data): Promise<Question[]> {
  const res = await axios.post(
    `${BACKEND}/api/generate`,
    data,
    { withCredentials: true }
  );
  return res.data.questions;
}
