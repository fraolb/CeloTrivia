import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const socket = io("http://localhost:3001");

interface Question {
  text: string;
  choices: string[];
}

function Room() {
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

    socket.on("quiz_finished", (winners) => {
      setAnswer("");
      setQuestion(null);
      console.log(`The winners are ${JSON.stringify(winners)}`);
      setWinners(winners);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_question");
      socket.off("receive_answer");
      socket.off("quiz_started");
      socket.off("quiz_finished");
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
                  {question.text}
                </h2>
                <ul>
                  <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {question.choices.map((choice, index) => (
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
                  className={`flex flex-col p-2 items-center border border-green-500 rounded-2xl`}
                >
                  <div
                    className={`p-4 rounded-full font-bold flex items-center justify-center text-4xl`}
                  >
                    {index + 1}
                  </div>
                  <div className=" text-lg text-center">
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
                  className={`flex flex-col p-2 items-center border border-green-500 rounded-2xl`}
                >
                  <div
                    className={`p-4 rounded-full font-bold flex items-center justify-center text-4xl`}
                  >
                    {index + 2}
                  </div>
                  <div className="text-lg text-center">
                    {/* {userId.slice(0, 4)}...{userId.slice(-4)} */}
                    {userId}
                    <br />
                    {points} points
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fixed bottom-8 left-8 bg-blue-500 text-white rounded-lg text-2xl text-center p-1 px-2">
            {userName}
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
