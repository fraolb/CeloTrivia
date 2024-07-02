import React, { useState } from "react";
import Head from "next/head";
import QuestionCard from "@/components/QuestionCard";
import { FaSave, FaCheck, FaTrash } from "react-icons/fa";

const CreateTrivia: React.FC = () => {
  const [triviaName, setTriviaName] = useState<string>("");
  const [questions, setQuestions] = useState<number[]>([0]);

  const addQuestion = () => {
    setQuestions([...questions, questions.length]);
  };

  const removeQuestion = (id: number) => {
    const updatedQuestions = questions
      .filter((question) => question !== id)
      .map((question, index) => index);
    setQuestions(updatedQuestions);
  };

  const handleDiscard = () => {
    setTriviaName("");
    setQuestions([0]);
  };

  const handleSave = () => {
    // Save logic goes here
    alert("Trivia saved!");
  };

  const handleContinueToHost = () => {
    // Continue to host logic goes here
    alert("Continue to host!");
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100 pb-32">
      <Head>
        <title>Create Trivia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mt-6 mb-12">Create Trivia</h1>

        <div className="w-full max-w-4xl flex justify-end gap-2  mb-4">
          <button
            className="flex items-center justify-center px-2 py-2 text-lg font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={handleDiscard}
          >
            <FaTrash className="mr-2" /> Discard
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSave}
          >
            <FaSave className="mr-2" /> Save
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleContinueToHost}
          >
            <FaCheck className="mr-2" /> Continue
          </button>
        </div>

        <form className="w-full max-w-4xl mb-2">
          <input
            type="text"
            placeholder="Enter Trivia Name"
            value={triviaName}
            onChange={(e) => setTriviaName(e.target.value)}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
        </form>

        <div className="w-full max-w-4xl">
          {questions.map((id) => (
            <QuestionCard key={id} id={id} onRemove={removeQuestion} />
          ))}
        </div>

        <button
          className="fixed bottom-10 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={addQuestion}
        >
          Add Question
        </button>
      </main>
    </div>
  );
};

export default CreateTrivia;
