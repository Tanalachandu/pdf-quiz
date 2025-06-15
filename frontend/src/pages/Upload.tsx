import { useEffect, useState } from "react";
import axios from "axios";
import type { Data } from "../types/Data";
import type { Question } from "../types/Question";
import getQuestions from "../gemini/config";
import Quiz from "./Quiz";

function Upload() {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubitted] = useState<Boolean>(false);
  const [text, setText] = useState("");
  const [formData, setFormData] = useState<Data>({
    content: "",
    count: 0,
    level: "easy",
    type: "conceptual",
    custom: ""
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const [isUploading, setIsUploading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!isLoading && !isUploading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, isUploading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);
    const formFile = new FormData();
    formFile.append("file", file);

    try {
      const res = await axios.post(`${backendUrl}/api/upload`, formFile);
      setText(res.data.text);
    } catch (err) {
      setError("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!text || formData.count < 1) throw Error;
      const updatedFormData = { ...formData, content: text };
      setFormData(updatedFormData);
      const q = await getQuestions(updatedFormData);
      setQuestions(q);
      setSubitted(true);
    } catch (err) {
      if (!text) {
        setError("Please upload a valid file");
      } else if (formData.count < 1) {
        setError("Please enter a valid number of questions");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!submitted ? (
        <>
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-violet-100 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8">
              <h1 className="text-4xl font-extrabold text-center text-violet-600 mb-6 tracking-tight">
                QuizGen ✨
              </h1>
              <p className="text-center text-gray-600 text-lg mb-6">
                File in. Quiz out.
                <br />
                <span className="text-sm">
                  (Convert files to quizzes efforlessly)
                </span>
              </p>
              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 border border-red-400 animate-pulse relative">
                  {/* <button
      className="absolute top-1.5 right-2 text-xl font-bold"
      onClick={() => setError(null)}
    >
      &times;
    </button> */}
                  {error}
                </div>
              )}

              {/* Upload */}
              <div className="mb-6">
                <label
                  htmlFor="file"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  📄 Upload a Document
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleUpload}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Number of Questions */}
                <div>
                  <label
                    htmlFor="count"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    🧮 Number of Questions
                  </label>
                  <input
                    type="number"
                    id="count"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Level */}
                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    🎯 Difficulty Level
                  </label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: e.target.value as "easy" | "medium" | "hard",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    🧠 Question Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "factual" | "conceptual",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="conceptual">Conceptual 💡</option>
                    <option value="factual">Factual 📘</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="count"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    ✍️ Custom Prompt (optional)
                  </label>
                  <textarea
                    id="custom"
                    value={formData.custom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custom: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="e.g. Generate more questions from a specific topic or specific type from this file"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUploading || isLoading || !text}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-lg shadow-md flex justify-center items-center transition duration-200 ${
                      isUploading || isLoading || !text
                        ? "bg-violet-400 text-white cursor-not-allowed"
                        : "bg-violet-500 text-white hover:bg-violet-600"
                    }`}
                  >
                    {isUploading
                      ? `📤 Uploading File${dots}`
                      : isLoading
                      ? `Generating${dots}`
                      : "🚀 Generate Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        <Quiz questions={questions} fileName={fileName} />
      )}
    </>
  );
}

export default Upload;
