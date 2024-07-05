import React, { useState } from "react";
import Head from "next/head";
import QuestionCard from "@/components/QuestionCard";
import { FaSave, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";

interface quizQuestionInterface {
  question: string;
  answers: string[];
  image: string | null;
  correctAnswer: number | null;
}

const CreateTrivia: React.FC = () => {
  const router = useRouter();
  const [triviaName, setTriviaName] = useState<string>("");
  const [questions, setQuestions] = useState<number[]>([0]);
  const [quizQuestions, setQuizQuestions] = useState<quizQuestionInterface[]>(
    []
  );

  const addQuestion = () => {
    setQuestions([...questions, questions.length]);
  };

  const addQuizQuestion = (data: quizQuestionInterface) => {
    console.log("the data passed is ", data);
    setQuizQuestions((prev) => [...prev, data]);
  };

  const removeQuestion = (id: number) => {
    const updatedQuestions = questions.filter((question) => question !== id);
    setQuestions(updatedQuestions);
    // Optionally, remove the corresponding quiz question data if needed
  };

  const handleDiscard = () => {
    setTriviaName("");
    setQuestions([0]);
    setQuizQuestions([]);
    router.push(`/dashboard`);
  };

  const handleSave = () => {
    // Save logic goes here
    console.log({ triviaName, quizQuestions });
    alert("Trivia saved!");
    router.push(`/dashboard`);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 bg-cover bg-center pb-32"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      <Head>
        <title>Create Trivia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mt-20 mb-12 text-white">
          Create Trivia
        </h1>

        <div className="w-full max-w-4xl flex justify-end gap-2 mb-4">
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
            <QuestionCard
              key={id}
              id={id}
              addQuizQuestion={addQuizQuestion}
              onRemove={removeQuestion}
            />
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
