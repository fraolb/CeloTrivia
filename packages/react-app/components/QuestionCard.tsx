import React, { useState } from "react";
import { FaCog, FaCheck } from "react-icons/fa";
import { TriviaInterface, QuestionInterface } from "@/types/questions";

interface QuestionCardProps {
  id: number;
  onRemove: (id: number) => void;
  addQuizQuestion: (data: QuestionInterface) => void;
}

interface quizQuestionInterface {
  question: string;
  answers: string[];
  image: string | null;
  correctAnswer: string | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  onRemove,
  addQuizQuestion,
}) => {
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [isTrueFalse, setIsTrueFalse] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const toggleQuestionType = () => {
    setIsTrueFalse(!isTrueFalse);
    if (!isTrueFalse) {
      setAnswers(["True", "False"]);
      setCorrectAnswer(null);
      setShowSettings(!showSettings);
    } else {
      setAnswers(["", "", "", ""]);
      setCorrectAnswer(null);
      setShowSettings(!showSettings);
    }
  };

  const addQuestion = () => {
    if (
      question.trim() === "" ||
      answers.some((answer) => answer.trim() === "") ||
      correctAnswer === null
    ) {
      setNotification(
        "Please fill in all fields and select the correct answer."
      );
    } else {
      const questionData: QuestionInterface = {
        question,
        options: answers,
        // image: image as string | null,
        answer: correctAnswer,
      };
      console.log(questionData);
      addQuizQuestion(questionData);
      setNotification("Question added successfully!");
    }
  };

  return (
    <div className="w-full p-4 mb-4 bg-white rounded-lg shadow-md relative">
      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={() => setShowSettings(!showSettings)}
      >
        <FaCog />
      </button>

      {showSettings && (
        <div className="absolute top-8 right-2 bg-blue-500 text-white border rounded-lg shadow-md">
          <button
            className="block w-full px-4 py-2 text-left"
            onClick={toggleQuestionType}
          >
            {isTrueFalse ? "Switch to Multiple Choice" : "Switch to True/False"}
          </button>
        </div>
      )}
      <div className="flex justify-start text-blue-600 text-lg">
        Question {id + 1}
      </div>
      <div className="flex flex-col items-center pt-4">
        <input
          type="text"
          placeholder="Enter Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        />
        <div className="relative w-1/2 h-20 mb-4 flex justify-center items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {image ? (
            <img
              src={image as string}
              alt="Question Image"
              className="w-full h-full object-cover p-4"
            />
          ) : (
            <span className="w-full h-full text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              Click to upload an image
            </span>
          )}
        </div>

        {isTrueFalse ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
            {["True", "False"].map((answer, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`correct-answer-${id}`}
                  checked={correctAnswer === answer}
                  onChange={() => setCorrectAnswer(answer)}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={answer}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
                {correctAnswer === answer && (
                  <FaCheck className="ml-2 text-green-500" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`correct-answer-${id}`}
                  checked={correctAnswer === answer}
                  onChange={() => setCorrectAnswer(answer)}
                  className="mr-2"
                />
                <input
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {correctAnswer === answer && (
                  <FaCheck className="ml-2 text-green-500" />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between w-full">
          <button
            className="mt-4 bg-green-600 text-white p-2 px-4 rounded-lg flex"
            onClick={addQuestion}
          >
            Add <FaCheck className="ml-2 mt-1 text-white" />
          </button>
          <button className="mt-4 text-red-500" onClick={() => onRemove(id)}>
            Remove Question
          </button>
        </div>
        {notification && (
          <div
            className="mt-4 p-2 text-white rounded-lg"
            style={{
              color: notification.includes("successfully")
                ? "#009933"
                : "#cc0000",
            }}
          >
            {notification}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
