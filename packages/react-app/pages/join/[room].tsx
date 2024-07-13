import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  type BaseError,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { createPrize } from "@/service/services";
import Link from "next/link";

const socket = io(
  `${process.env.NEXT_PUBLIC_SERVER_API || "http://localhost:3001"}`
);

interface Question {
  question: string;
  options: string[];
}

type CloseQuiz = {
  key: string;
  prizes: number[] | string;
  winners: [string, number][];
};

function Room() {
  const { address, isConnected, chainId } = useAccount();
  const router = useRouter();
  const { room } = router.query;

  const [userName, setUserName] = useState("");
  const [userNameForm, setUserNameForm] = useState("");
  const [message, setMessage] = useState<string>("");
  const [messageReceived, setMessageReceived] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [yourAnswer, setYourAnswer] = useState<string>("");
  const [clickable, setClickable] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [winners, setWinners] = useState<[string, number][]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userNameRef = useRef(userName);

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  const submitAnswer = (choice: string) => {
    setYourAnswer(choice);
    socket.emit("answer_question", { room, answer: choice, name: userName });
    setClickable(false);
  };

  const handleAddName = async () => {
    socket.emit("add_name", { room, name: userNameForm });
    setUserName(userNameForm);
  };

  // Update the ref whenever userName changes
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    const handleQuizFinished = async (closeQuiz: CloseQuiz) => {
      setAnswer("");
      setQuestion(null);
      console.log("the winner is ", closeQuiz);
      console.log(`The winners are ${JSON.stringify(closeQuiz)}`);

      const currentUserName = userNameRef.current;
      console.log("My name is ", currentUserName);

      const winnerIndex = closeQuiz.winners.findIndex(
        (winner: [string, number]) => winner[0] === currentUserName
      );
      console.log("the winner index is ", winnerIndex);

      if (winnerIndex !== -1) {
        console.log(`Congratulations! You won a prize: ${winnerIndex}`);
        if (closeQuiz.key !== "Null" && closeQuiz.prizes !== "Null") {
          const prizeVal =
            closeQuiz.winners.length == 1
              ? closeQuiz.prizes
              : closeQuiz.prizes[winnerIndex];
          console.log(`Congratulations! You won a prize: ${prizeVal}`);
          const prize = {
            walletAddress: address as string,
            owner: false,
            amount: prizeVal as number,
            code: `${closeQuiz.key}`,
          };
          try {
            const res = await createPrize(prize);
            console.log("Prize creation response:", res);
            if (res.success == true) {
              setIsModalOpen(true);
            }
          } catch (error) {
            console.error("Error creating prize:", error);
          }
        }
      } else {
        console.log("You did not win a prize.");
      }

      setWinners(closeQuiz.winners);
    };

    socket.on("quiz_finished", handleQuizFinished);

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("quiz_finished", handleQuizFinished);
    };
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessages) => [...prevMessages, data.message]);
    });

    socket.on("receive_question", (question: Question) => {
      setQuestion(question);
      setAnswer(""); // Clear previous answer
      setYourAnswer("");
      setClickable(true);
      startQuestionTimer();
    });

    socket.on("quiz_started", () => {
      startQuizTimer();
    });

    socket.on("receive_answer", (answer: string) => {
      setAnswer(answer);
      setQuestion(null);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_question");
      socket.off("receive_answer");
      socket.off("quiz_started");
    };
  }, []);

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }
  }, [room]);

  const startQuizTimer = () => {
    let startCountdown = 5;
    setCountdown(startCountdown);

    const countdownInterval = setInterval(() => {
      startCountdown -= 1;
      setCountdown(startCountdown);
      if (startCountdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  };

  const startQuestionTimer = () => {
    let questionCountdown = 10;
    setCountdown(questionCountdown);

    const questionInterval = setInterval(() => {
      questionCountdown -= 1;
      setCountdown(questionCountdown);
      if (questionCountdown <= 0) {
        clearInterval(questionInterval);
      }
    }, 1000);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 pt-12 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      {userName !== "" ? (
        <div>
          {question == null && !answer && winners.length == 0 && (
            <div className="mt-20 text-2xl flex items-center justify-center gap-2">
              Get ready{" "}
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white "
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          )}
          {question == null && answer && winners.length == 0 && (
            <div className="mt-20 text-2xl flex items-center justify-center gap-2">
              Get ready for the next{" "}
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white "
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          )}
          <div className="mt-8">
            {question && (
              <div>
                <h2 className="w-full p-2 mb-4 border border-gray-300 rounded-md text-center text-2xl">
                  {question.question}
                </h2>
                <ul>
                  <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {question.options.map((choice, index) => (
                      <button
                        key={index}
                        disabled={!clickable}
                        onClick={() => submitAnswer(choice)}
                        className="w-full p-2 border border-gray-300 rounded-md text-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-white"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </ul>
              </div>
            )}
          </div>
          <div className="w-full flex p-2 mb-4 text-center text-2xl">
            {countdown > 0 && (
              <p className="w-full text-center">
                Time remaining:{" "}
                <div className="text-3xl font-bold text-center">
                  {countdown}
                </div>{" "}
              </p>
            )}
          </div>
          <div>
            {answer !== "" && yourAnswer && (
              <div
                className={`w-full p-2 mb-4 text-center text-2xl ${
                  yourAnswer === answer ? "text-green-500" : "text-red-500"
                }`}
              >
                {yourAnswer === answer
                  ? "You are correct!"
                  : "Ooops, wrong answer."}
              </div>
            )}
          </div>
          <div className="mt-8">
            {winners.length > 0 && (
              <h3 className="text-4xl text-center mb-8">Trivia Winners</h3>
            )}
            <div className="flex justify-center space-x-8">
              {winners.slice(0, 1).map(([userId, points], index) => (
                <div
                  key={index}
                  className={`flex flex-col w-1/2 h-1/2 p-2 items-center bg-blue-500 border border-green-500 rounded-full relative`}
                >
                  <div
                    className={`font-bold flex items-center justify-center text-4xl absolute bottom-16`}
                  >
                    {index + 1}
                  </div>
                  <div className="p-2 text-lg text-center">
                    {/* {userId.slice(0, 4)}...{userId.slice(-4)} */}
                    {userId}
                    <br />
                    {points} points
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-8">
              {winners.slice(1, 3).map(([userId, points], index) => (
                <div
                  key={index}
                  className={`flex flex-col w-1/2 h-1/2 p-2 items-center bg-blue-500 border border-green-500 rounded-full relative`}
                >
                  <div
                    className={`font-bold flex items-center justify-center text-4xl absolute bottom-16`}
                  >
                    {index + 2}
                  </div>
                  <div className="p-2 text-lg text-center">
                    {/* {userId.slice(0, 4)}...{userId.slice(-4)} */}
                    {userId}
                    <br />
                    {points} points
                  </div>
                </div>
              ))}
            </div>
            {winners.length > 0 && (
              <div className="flex justify-center">
                <Link
                  className="bg-green-500 text-white p-2 mt-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  href={"/"}
                >
                  Go to Home
                </Link>
              </div>
            )}
          </div>
          <div className="fixed bottom-8 left-8 bg-blue-500 text-white rounded-lg text-2xl text-center p-1 px-2">
            {userName}
          </div>
          <div>
            {isModalOpen ? (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow-lg md:w-3/5 text-black">
                  <div className="text-green-500 text-lg text-center">
                    Congratulations you have won the trivia
                  </div>
                  <div className="flex justify-between px-4">
                    <Link
                      className="bg-green-500 text-white p-2 mt-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      href={"/claimPrize"}
                    >
                      Claim Now
                    </Link>
                    <Link
                      className="bg-red-500 text-white p-2 mt-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      href={"/"}
                    >
                      Claim Later
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div>
          <div className="w-full max-w-md p-8 mt-20 rounded-lg shadow-md border border-solid bg-white bg-opacity-50">
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(event) => {
                setUserNameForm(event.target.value);
              }}
              className="w-full p-3 mb-6 text-black text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleAddName()}
              className="w-full p-3 mb-4 text-lg font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Room;
