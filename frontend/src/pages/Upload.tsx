import { useEffect, useState, useRef } from "react";
import axios from "axios";
import type { Data } from "../types/Data";
import type { Question } from "../types/Question";
import Quiz from "./Quiz.tsx"; // <-- VERIFY THIS PATH in your actual project structure!

function Upload() {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [text, setText] = useState("");
  const [isTimedQuiz, setIsTimedQuiz] = useState<boolean>(false);
  const [formData, setFormData] = useState<Data>({
    content: "",
    count: 0,
    level: "easy",
    type: "mcq",
    custom: "",
    timer: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!isLoading && !isUploading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading, isUploading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    const formFile = new FormData();
    formFile.append("file", file);

    try {
      const res = await axios.post(`${backendUrl}/api/upload`, formFile);
      setText(res.data.text);
      setError(null);
    } catch {
      setError("File upload failed. Please try again.");
      setText("");
      setFileName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!text) {
        throw new Error("Please upload a valid file.");
      }
      if (formData.count < 1) {
        throw new Error("Please enter a valid number of questions (at least 1).");
      }
      if (isTimedQuiz && formData.timer <= 0) {
          throw new Error("Please set a valid timer duration for a timed quiz.");
      }

      const finalFormData = { ...formData, content: text, timer: isTimedQuiz ? formData.timer : 0 };
      setFormData(finalFormData);

      const res = await axios.post(`${backendUrl}/api/generate`, finalFormData);
      setQuestions(res.data.questions);
      setSubmitted(true);
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "Failed to generate questions. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!submitted ? (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4 py-12 font-inter">
          <style>
            {`
            /* Custom Scrollbar for subtle look */
            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: #0a0a0a; /* Darker track */
            }
            ::-webkit-scrollbar-thumb {
              background: #3a3a3a;
              border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #5a5a5a;
            }
            /* Apply Inter font, if not already global */
            body {
              font-family: 'Inter', sans-serif;
            }
            `}
          </style>
          <div className="w-full max-w-2xl bg-neutral-900 rounded-lg border border-neutral-700 shadow-2xl p-8 space-y-6">
            <h1 className="text-3xl font-bold text-center text-teal-400 leading-tight">
              Text2Quiz <span className="block text-xl font-medium text-neutral-400 mt-1">Generate Quizzes Instantly</span>
            </h1>
            <p className="text-center text-neutral-500 text-sm">
              Transform your documents into interactive quizzes with ease.
            </p>

            {error && (
              <div className="bg-red-900/50 text-red-300 px-4 py-2 rounded-md border border-red-700 text-center text-sm font-medium">
                {error}
              </div>
            )}

            {/* Custom Upload Input */}
            <div className="space-y-2">
              <label htmlFor="file-upload" className="block text-sm font-medium text-neutral-300">
                📥 Upload Document
              </label>
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="w-full flex flex-col items-center justify-center p-5 border border-dashed border-teal-600 rounded-md cursor-pointer bg-neutral-950 hover:bg-neutral-800 transition-colors duration-200 text-center"
              >
                {isUploading ? (
                  <span className="text-teal-400 text-base font-medium">Uploading File{dots}</span>
                ) : fileName ? (
                  <>
                    <svg className="w-8 h-8 text-lime-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-lime-400 text-base font-medium">File Selected: {fileName}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-teal-500 mb-1 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <span className="text-neutral-400 text-base font-bold group-hover:text-neutral-300 transition-colors">
                      Drag & Drop or <span className="text-teal-400 group-hover:text-teal-300 underline">Browse</span>
                    </span>
                    <span className="text-xs text-neutral-600 mt-0.5">(PDF, DOCX, TXT)</span>
                  </>
                )}
              </label>
              {fileName && !isUploading && (
                  <p className="text-xs text-neutral-500 text-center font-medium">
                      <span className="text-teal-400">{fileName}</span> ready for quiz.
                  </p>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Number of Questions */}
              <div className="relative">
                <label htmlFor="count" className="block text-sm font-medium text-neutral-300 mb-1">
                  🔢 Number of Questions
                </label>
                <input
                  type="number"
                  id="count"
                  value={formData.count === 0 ? "" : formData.count}
                  onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  min="1"
                  placeholder="e.g., 10"
                />
              </div>

              {/* Difficulty Level */}
              <div className="relative">
                <label htmlFor="level" className="block text-sm font-medium text-neutral-300 mb-1">
                  🎯 Difficulty
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as "easy" | "medium" | "hard" })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime-500 appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z"/></svg>
                </div>
              </div>

              {/* Question Type Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  🧠 Question Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label htmlFor="type-mcq" className="flex items-center space-x-2 cursor-pointer p-2 bg-neutral-950 border border-neutral-700 rounded-md has-[:checked]:bg-teal-700 has-[:checked]:border-teal-600 transition duration-200">
                    <input
                      type="radio"
                      id="type-mcq"
                      name="questionType"
                      value="mcq"
                      checked={formData.type === "mcq"}
                      onChange={() => setFormData({ ...formData, type: "mcq" })}
                      className="form-radio h-4 w-4 text-teal-500 border-neutral-600 focus:ring-teal-400"
                    />
                    <span className="ml-1 text-neutral-300 text-sm">MCQ</span>
                  </label>
                  <label htmlFor="type-true-false" className="flex items-center space-x-2 cursor-pointer p-2 bg-neutral-950 border border-neutral-700 rounded-md has-[:checked]:bg-teal-700 has-[:checked]:border-teal-600 transition duration-200">
                    <input
                      type="radio"
                      id="type-true-false"
                      name="questionType"
                      value="true-false"
                      checked={formData.type === "true-false"}
                      onChange={() => setFormData({ ...formData, type: "true-false" })}
                      className="form-radio h-4 w-4 text-teal-500 border-neutral-600 focus:ring-teal-400"
                    />
                    <span className="ml-1 text-neutral-300 text-sm">True/False</span>
                  </label>
                </div>
              </div>

              {/* Quiz Mode: Timed vs Normal */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  ⏱️ Quiz Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label htmlFor="mode-normal" className="flex items-center space-x-2 cursor-pointer p-2 bg-neutral-950 border border-neutral-700 rounded-md has-[:checked]:bg-emerald-700 has-[:checked]:border-emerald-600 transition duration-200">
                    <input
                      type="radio"
                      id="mode-normal"
                      name="quizMode"
                      checked={!isTimedQuiz}
                      onChange={() => setIsTimedQuiz(false)}
                      className="form-radio h-4 w-4 text-emerald-500 border-neutral-600 focus:ring-emerald-400"
                    />
                    <span className="ml-1 text-neutral-300 text-sm">Normal Quiz</span>
                  </label>
                  <label htmlFor="mode-timed" className="flex items-center space-x-2 cursor-pointer p-2 bg-neutral-950 border border-neutral-700 rounded-md has-[:checked]:bg-red-700 has-[:checked]:border-red-600 transition duration-200">
                    <input
                      type="radio"
                      id="mode-timed"
                      name="quizMode"
                      checked={isTimedQuiz}
                      onChange={() => setIsTimedQuiz(true)}
                      className="form-radio h-4 w-4 text-red-500 border-neutral-600 focus:ring-red-400"
                    />
                    <span className="ml-1 text-neutral-300 text-sm">Timed Quiz</span>
                  </label>
                </div>
              </div>

              {/* Timer Input - Conditionally enabled/disabled */}
              <div className="relative">
                <label
                  htmlFor="timer"
                  className={`block text-sm font-medium mb-1 ${
                    isTimedQuiz ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  ⏳ Set Timer (in minutes)
                </label>
                <input
                  type="number"
                  id="timer"
                  value={formData.timer === 0 ? "" : formData.timer}
                  onChange={(e) => setFormData({ ...formData, timer: Number(e.target.value) })}
                  placeholder="e.g., 10"
                  disabled={!isTimedQuiz}
                  className={`w-full px-3 py-2 border rounded-md text-white focus:outline-none focus:ring-1 ${
                    isTimedQuiz
                      ? "bg-neutral-950 border-neutral-700 focus:ring-teal-500"
                      : "bg-neutral-700 border-neutral-700 cursor-not-allowed opacity-70"
                  }`}
                  min="1"
                />
              </div>

              {/* Custom Prompt */}
              <div className="relative">
                <label htmlFor="custom" className="block text-sm font-medium text-neutral-300 mb-1">
                  ✍️ Custom Prompt (optional)
                </label>
                <textarea
                  id="custom"
                  value={formData.custom}
                  onChange={(e) => setFormData({ ...formData, custom: e.target.value })}
                  rows={3}
                  placeholder="e.g., Focus only on chapter 3 or ask definitions only."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-teal-400 resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-5">
                <button
                  type="submit"
                  disabled={isUploading || isLoading || !text || (isTimedQuiz && formData.timer <= 0)}
                  className={`w-full py-2.5 px-6 rounded-md font-bold text-base flex justify-center items-center transition duration-200 ${
                    isUploading || isLoading || !text || (isTimedQuiz && formData.timer <= 0)
                      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isUploading
                    ? `📤 Uploading Document${dots}`
                    : isLoading
                    ? `🧠 Generating Quiz${dots}`
                    : "🚀 Generate Your Quiz!"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <Quiz
          questions={questions}
          fileName={fileName}
          timer={isTimedQuiz ? formData.timer : 0}
        />
      )}
    </>
  );
}

export default Upload;
