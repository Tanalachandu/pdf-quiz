import { useState, useRef, useEffect, useCallback } from "react";
import type { Question } from "../types/Question";
import jsPDF from "jspdf";

type QuizProps = {
  questions: Question[];
  fileName: string | null;
  timer: number; // Timer in minutes
};

function Quiz({ questions, fileName, timer }: QuizProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timer * 60);
  const [showTimeExpired, setShowTimeExpired] = useState(false);

  const scoreRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Use useCallback to memoize the submitQuiz function.
  const submitQuiz = useCallback((autoSubmitted: boolean = false) => {
    // Clear the timer interval immediately upon submission, regardless of where submitQuiz is called
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Clear the ref
    }

    let calculatedScore = 0;
    userAnswers.forEach((answer, idx) => {
      if (answer === questions[idx].answer) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true); // Mark quiz as submitted
    if (autoSubmitted) {
      setShowTimeExpired(true); // Show time expired message if auto-submitted
    }

    // Scroll to score after a short delay
    setTimeout(() => {
      scoreRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [userAnswers, questions]); // Dependencies for useCallback

  // Effect to manage the timer countdown
  useEffect(() => {
    // Only start a timer if it's a timed quiz AND not yet submitted
    if (timer > 0 && !submitted) {
      // Clear any *existing* interval before starting a new one
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null; // Clear the ref here too
            if (!submitted) { // Check submitted again to prevent double-submission
              submitQuiz(true); // Auto-submit when timer runs out
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      // If timer is off (timer <= 0) or quiz is submitted, clear any running interval
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Clear the ref
    }

    // Cleanup function: Clear interval when component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null; // Ensure ref is nullified on cleanup
      }
    };
  }, [timer, submitted, submitQuiz]); // Dependencies for useEffect: react to changes in these values

  // Effect to initialize or reset timeLeft based on the timer prop.
  // This runs when `timer` or `questions.length` changes (e.g., when a new quiz is loaded or retaken).
  useEffect(() => {
    if (timer > 0) {
      setTimeLeft(timer * 60);
    } else {
      setTimeLeft(0); // If not a timed quiz, ensure time is 0
    }
    // Also reset showTimeExpired here, as a new quiz/retake implies fresh start
    setShowTimeExpired(false);
  }, [timer, questions.length]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSelect = (index: number, value: string) => {
    if (submitted) return;

    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleRetake = () => {
    // 1. Ensure any currently running timer is stopped immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Clear the ref
    }

    // 2. Reset all relevant states for a fresh start
    setSubmitted(false);
    setScore(0);
    setUserAnswers(Array(questions.length).fill(""));
    setShowTimeExpired(false); // Reset the "Time's up!" message

    // 3. Reset timeLeft. The main useEffect (dependent on `submitted` and `timer`)
    // will then naturally restart the timer if `timer > 0`.
    if (timer > 0) {
      setTimeLeft(timer * 60); // Reset time to initial duration
    } else {
      setTimeLeft(0); // If not a timed quiz, ensure time is zero
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${fileName || 'Generated'} quiz with answers:`, 10, 10); // Added default filename
    let y = 20;
    const maxWidth = 180; // Max width for text before wrapping
    const lineHeight = 7; // Estimated line height for questions
    const optionLineHeight = 6; // Estimated line height for options
    const answerLineHeight = 6; // Estimated line height for answers

    // Helper function to add page if content exceeds current page
    const checkPageBreak = () => {
      if (y > 270) { // Assuming 297mm height (A4), 270 is a safe margin
        doc.addPage();
        y = 10; // Reset y for new page
      }
    };

    questions.forEach((q, index) => {
      checkPageBreak();
      const questionLines = doc.splitTextToSize(`${index + 1}. ${q.question}`, maxWidth);
      doc.text(questionLines, 10, y);
      y += questionLines.length * lineHeight;

      q.options.forEach((opt) => {
        checkPageBreak();
        const optionLines = doc.splitTextToSize(`- ${opt}`, maxWidth - 4); // Indent options slightly
        doc.text(optionLines, 14, y);
        y += optionLines.length * optionLineHeight;
      });

      y += 6; // Small gap after options
      checkPageBreak();
    });

    // Add a clear break before answers section
    y += 10;
    checkPageBreak();


    doc.setFontSize(12);
    doc.text("Answers:", 10, y);
    y += 8;

    questions.forEach((q, index) => { // Changed from map to forEach as we're not returning a new array
      checkPageBreak();
      const answerLines = doc.splitTextToSize(`${index + 1}. ${q.answer}`, maxWidth);
      doc.text(answerLines, 10, y);
      y += answerLines.length * answerLineHeight;
    });

    doc.save(`${fileName || 'quiz_results'}.pdf`); // Added default filename
  };

  return (
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
      <div className="w-full max-w-3xl bg-neutral-900 rounded-lg border border-neutral-700 shadow-xl p-8 space-y-6">
        <div
          ref={scoreRef}
          className="flex flex-col-reverse md:flex-row justify-between items-center mb-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-teal-400 tracking-tight">
            Take the Quiz
          </h1>
          <button
            className="bg-lime-600 hover:bg-lime-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200 mb-10 md:mb-2.5"
            onClick={handleDownload}
          >
            📄 Download PDF
          </button>
        </div>

        {/* Timer display */}
        {timer > 0 && !submitted && (
          <div className="text-center text-xl font-bold text-teal-400 bg-neutral-800 border border-teal-500 p-3 rounded-md shadow-sm mb-4">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}

        {/* Time expired message */}
        {showTimeExpired && (
          <div className="text-center text-lg font-bold text-red-400 bg-red-900/50 border border-red-700 p-3 rounded-md shadow-sm mb-4">
            ⏰ Time's up! Your quiz has been auto-submitted.
          </div>
        )}

        {/* Score display and Retake button */}
        {submitted && (
          <>
            <div className="text-lg font-semibold text-lime-400 text-center bg-emerald-900/50 border border-emerald-700 p-3 rounded-md shadow-sm">
              🥳 You scored {score} out of {questions.length}
            </div>
            <button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-md font-bold text-base shadow transition duration-200"
              onClick={handleRetake}
            >
              🔁 Retake Quiz
            </button>
          </>
        )}

        {/* Quiz Questions */}
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = submitted && userAnswer === q.answer;

          return (
            <div
              key={index}
              className="bg-neutral-800 border border-neutral-700 rounded-lg p-5 shadow space-y-3"
            >
              <h2 className="font-semibold text-lg text-neutral-200">
                {index + 1}. {q.question}
              </h2>
              <ul className="space-y-2">
                {q.options.map((opt: string, optIndex: number) => {
                  const isUserAnswer = userAnswer === opt;
                  const isCorrectAnswer = q.answer === opt;

                  let optionStyle = "hover:bg-neutral-700 border-neutral-600";
                  if (submitted) {
                    if (isUserAnswer && isCorrect) {
                      optionStyle = "bg-emerald-700 border-emerald-600";
                    } else if (isUserAnswer && !isCorrect) {
                      optionStyle = "bg-red-700 border-red-600";
                    } else if (!isUserAnswer && isCorrectAnswer) {
                      optionStyle = "bg-emerald-800/60 border-emerald-700";
                    } else {
                      optionStyle = "bg-neutral-700 border-neutral-600 opacity-60";
                    }
                  } else if (isUserAnswer) {
                    optionStyle = "bg-teal-700 border-teal-600";
                  }

                  return (
                    <li key={optIndex}>
                      <label
                        className={`flex items-center space-x-3 p-2 rounded-md border cursor-pointer ${optionStyle} ${
                          submitted ? "cursor-not-allowed" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={opt}
                          checked={isUserAnswer}
                          disabled={submitted}
                          onChange={() => handleSelect(index, opt)}
                          className="accent-teal-400"
                        />
                        <span className="text-sm text-neutral-300">{opt}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Submit button */}
        {!submitted && (
          <div className="pt-4">
            <button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-6 rounded-md font-bold text-base shadow transition duration-200"
              onClick={() => submitQuiz(false)}
            >
              🚀 Submit Answers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
