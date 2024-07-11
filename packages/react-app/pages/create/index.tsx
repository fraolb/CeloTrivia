import React, { useState } from "react";
import Head from "next/head";
import QuestionCard from "@/components/QuestionCard";
import { FaSave, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import { createTrivia } from "@/service/services";
import { TriviaInterface, QuestionInterface } from "@/types/questions";
import {
  type BaseError,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

// interface quizQuestionInterface {
//   question: string;
//   answers: string[];
//   image: string | null;
//   correctAnswer: string | null;
// }

interface notificationInterfact {
  message: string;
  type: string;
}

const CreateTrivia: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const router = useRouter();
  const [triviaName, setTriviaName] = useState<string>("");
  const [questions, setQuestions] = useState<number[]>([0]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionInterface[]>([]);
  const [notification, setNotification] =
    useState<notificationInterfact | null>();
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, questions.length]);
  };

  const addQuizQuestion = (data: QuestionInterface) => {
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

  const handleSave = async () => {
    // Save logic goes here
    setLoading(true);
    console.log({ triviaName, quizQuestions });

    if (triviaName == "" || quizQuestions.length == 0) {
      setNotification({
        message: "Add Trivia name and Questions",
        type: "error",
      });
      setLoading(false);
    } else {
      const data = {
        walletAddress: address as string,
        triviaName: triviaName,
        questions: quizQuestions,
      };

      const res = await createTrivia(data);
      console.log("the res is ", res);
      if (res.success == true) {
        setNotification({
          message: "Questions are saved!",
          type: "success",
        });
        setLoading(false);
      } else {
        setNotification({
          message: "Error happened while saving!",
          type: "error",
        });
        setLoading(false);
      }
    }

    setTimeout(() => setNotification(null), 3000);
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
        {notification && (
          <div
            className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-12 p-2 px-4 w-3/4 rounded shadow-lg z-10 ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {notification.message}
          </div>
        )}
        <h1 className="text-4xl font-bold mt-20 mb-12 text-white">
          Create Trivia
        </h1>

        <div className="w-full max-w-4xl flex justify-end gap-2 mb-4">
          <button
            className="flex items-center justify-center px-2 py-2 text-lg font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={handleDiscard}
            disabled={loading}
          >
            <FaTrash className="mr-2" /> Discard
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSave}
            disabled={loading}
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
            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-center"
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
          disabled={loading}
        >
          Add Question
        </button>
      </main>
    </div>
  );
};

export default CreateTrivia;
