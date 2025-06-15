import { useState, useRef } from "react";
import type { Question } from "../types/Question";
import jsPDF from "jspdf";

type QuizProps = {
  questions: Question[];
  fileName: string | null;
};

function Quiz({ questions, fileName }: QuizProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const scoreRef = useRef<HTMLDivElement>(null);

  const handleSelect = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    userAnswers.forEach((answer, idx) => {
      if (answer === questions[idx].answer) calculatedScore += 1;
    });
    setScore(calculatedScore);
    setSubmitted(true);
    setTimeout(() => {
      scoreRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleRetake = () => {
    setSubmitted(false);
    setScore(0);
    setUserAnswers(Array(questions.length).fill(""));
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${fileName} quiz with answers:`, 10, 10);

    let y = 20;

    const wrapText = (text: string, maxWidth = 180) => {
      return doc.splitTextToSize(text, maxWidth);
    };

    // Print questions
    questions.forEach((q, index) => {
      const questionLines = wrapText(`${index + 1}. ${q.question}`);
      doc.text(questionLines, 10, y);
      y += questionLines.length * 7;

      q.options.forEach((opt) => {
        const optionLines = wrapText(`- ${opt}`);
        doc.text(optionLines, 14, y);
        y += optionLines.length * 6;

        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });

      y += 6;

      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    y += 10;

    if (y > 260) {
      doc.addPage();
      y = 10;
    }

    // Print 'Answers'
    doc.setFontSize(12);
    doc.text("Answers:", 10, y);
    y += 8;

    // Print all answers
    questions.map((q, index) => {
      const answerLines = wrapText(`${index + 1}. ${q.answer}`);
      doc.text(answerLines, 10, y);
      y += answerLines.length * 6;

      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(`${fileName} quiz with answers.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-violet-100 px-4 py-10 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <div
          ref={scoreRef}
          className="flex flex-col-reverse md:flex-row justify-between items-center mb-4"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-violet-600 tracking-tight">
            Take the Quiz
          </h1>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 mb-10 md:mb-2.5"
            onClick={handleDownload}
          >
            📄 Download PDF
          </button>
        </div>

        {submitted && (
          <>
            <div className="text-lg font-semibold text-green-600 text-center bg-green-50 border border-green-300 p-3 rounded-xl shadow-sm">
              🎉 You scored {score} out of {questions.length}
            </div>
            <button
              className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-lg font-semibold text-lg shadow transition duration-200"
              onClick={handleRetake}
            >
              🔁 Retake Quiz
            </button>
          </>
        )}

        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === q.answer;

          return (
            <div
              key={index}
              className="bg-gray-50 border border-violet-200 rounded-xl p-4 shadow-sm space-y-3"
            >
              <h2 className="font-semibold text-lg text-gray-800">
                {index + 1}. {q.question}
              </h2>
              <ul className="space-y-2">
                {q.options.map((opt: string, optIndex: number) => {
                  const isUserAnswer = userAnswer === opt;
                  const isCorrectAnswer = q.answer === opt;

                  let optionStyle = "hover:bg-gray-100 border-gray-300";
                  if (submitted) {
                    if (isUserAnswer && isCorrect) {
                      optionStyle = "bg-green-100 border-green-400";
                    } else if (isUserAnswer && !isCorrect) {
                      optionStyle = "bg-red-100 border-red-400";
                    } else if (!isUserAnswer && isCorrectAnswer) {
                      optionStyle = "bg-green-50 border-green-300";
                    } else {
                      optionStyle = "bg-white border-gray-200 opacity-70";
                    }
                  } else if (isUserAnswer) {
                    optionStyle = "bg-violet-100 border-violet-400";
                  }

                  return (
                    <li key={optIndex}>
                      <label
                        className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer ${optionStyle} ${
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
                          className="accent-violet-500"
                        />
                        <span className="text-sm text-gray-800">{opt}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {!submitted && (
          <div className="pt-4">
            <button
              className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-lg font-semibold text-lg shadow transition duration-200"
              onClick={handleSubmit}
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
