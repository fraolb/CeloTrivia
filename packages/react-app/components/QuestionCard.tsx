import React, { useState } from "react";
import { FaCog } from "react-icons/fa";

interface QuestionCardProps {
  id: number;
  onRemove: (id: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ id, onRemove }) => {
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [isTrueFalse, setIsTrueFalse] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

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
      setShowSettings(!showSettings);
    } else {
      setAnswers(["", "", "", ""]);
      setShowSettings(!showSettings);
    }
  };

  return (
    <div className="w-full p-4 mb-4 bg-white rounded-lg shadow-md relative">
      <button
        className="absolute top-2 right-2 text-gray-500 "
        onClick={() => setShowSettings(!showSettings)}
      >
        <FaCog />
      </button>

      {showSettings && (
        <div className="absolute top-8 right-2 bg-white border rounded-lg shadow-md">
          <button
            className="block w-full px-4 py-2 text-left"
            onClick={toggleQuestionType}
          >
            {isTrueFalse ? "Switch to Multiple Choice" : "Switch to True/False"}
          </button>
        </div>
      )}
      <div className="flex justify-start">Q{id}</div>
      <div className="flex flex-col items-center pt-4">
        <input
          type="text"
          placeholder="Enter Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        />
        <div className="relative w-full h-40  mb-4 flex justify-center items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer "
          />
          {image ? (
            <img
              src={image as string}
              alt="Question Image"
              className="w-full h-full object-cover p-4 "
            />
          ) : (
            <span className="w-full h-full text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              Click to upload an image
            </span>
          )}
        </div>

        {isTrueFalse ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value="True"
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
            <input
              type="text"
              value="False"
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
            {answers.map((answer, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Answer ${index + 1}`}
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            ))}
          </div>
        )}
        <button className="mt-4 text-red-500" onClick={() => onRemove(id)}>
          Remove Question
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
