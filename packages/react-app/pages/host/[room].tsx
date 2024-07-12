import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { deletePrize } from "@/service/services";

interface Question {
  text: string;
  choices: string[];
  answer: string;
}

interface UserAnswer {
  answer: string;
  id: string;
  point: number;
}

const socket = io("http://localhost:3001", {
  auth: { isCreator: true },
});

const HostPage = () => {
  const router = useRouter();
  const { room, id, prizeValue, prizes, numberOfPrizes, key } = router.query;

  const [message, setMessage] = useState<string>("");
  const [messageReceived, setMessageReceived] = useState<string>("");
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "What is the capital of France?",
      choices: ["Paris", "Berlin", "Madrid", "Rome"],
      answer: "Paris",
    },
    {
      text: "What is 2 + 2?",
      choices: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      text: "2 + 2 is 4",
      choices: ["True", "False"],
      answer: "True",
    },
    // Add more questions as needed
  ]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [totalUserAnswers, setTotalUserAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [playerNames, setPlayerNames] = useState([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [winners, setWinners] = useState<[string, number][]>([]);

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  const startQuiz = () => {
    socket.emit("start_quiz", room);
    let startCountdown = 5;
    setCountdown(startCountdown);

    const countdownInterval = setInterval(() => {
      startCountdown -= 1;
      setCountdown(startCountdown);
      if (startCountdown <= 0) {
        clearInterval(countdownInterval);
        setQuizStarted(true);
        startQuestionTimer(0);
      }
    }, 1000);
  };

  const startQuestionTimer = (qIndex: number) => {
    let questionCountdown = 10;
    setCountdown(questionCountdown);
    console.log("the question index is ", questionIndex);
    socket.emit("send_question", { room, question: questions[qIndex] });

    const questionInterval = setInterval(() => {
      questionCountdown -= 1;
      setCountdown(questionCountdown);
      if (questionCountdown <= 0) {
        clearInterval(questionInterval);
        setShowAnswer(true);
        socket.emit("show_answer", {
          room,
          answer: questions[qIndex].answer,
        });
      }
    }, 1000);
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    setUserAnswers([]);
    setQuestionIndex(questionIndex + 1);
    const qIndex = questionIndex + 1;
    startQuestionTimer(qIndex);
  };

  const finishQuestion = async () => {
    // Convert totalUserAnswers object to an array of [user, points] pairs
    const userPointsArray = Object.entries(totalUserAnswers);

    // Sort the array by points in descending order
    userPointsArray.sort((a, b) => b[1] - a[1]);

    // Get the top 3 scorers
    const num = Number(numberOfPrizes);
    if (key !== undefined && prizes !== undefined && id !== undefined) {
      const winners = userPointsArray.slice(0, num);
      const res = await deletePrize(id as string);
      console.log("the delete res is ", res);
      console.log("the winners are ", winners, key, prizes);
      setWinners(winners);

      // Emit the quiz_finished event with the top scorers
      socket.emit("close_quiz", { room, winners, key, prizes });
    } else {
      const winners = userPointsArray.slice(0, 3);
      console.log("the winners are ", winners, key, prizes);
      setWinners(winners);

      // Emit the quiz_finished event with the top scorers
      socket.emit("close_quiz", { room, winners, key: "Null", prizes: "Null" });
    }
  };

  useEffect(() => {
    if (room) {
      socket.emit("create_room", room);
      socket.emit("join_room", room);
    }
  }, [room]);

  useEffect(() => {
    if (room) {
      socket.on("receive_message", (data) => {
        setMessageReceived(data.message);
      });
      socket.on("user_joined", (data) => {
        console.log("the players name is ", data);
        setPlayerNames(data);
      });
      socket.on("receive_users_answer", (data: UserAnswer) => {
        const point = data.answer === questions[questionIndex].answer ? 1 : 0;
        const usrData = { ...data, point };
        setUserAnswers((prevUserAnswers) => [...prevUserAnswers, usrData]);

        // Update totalUserAnswers
        if (point > 0) {
          setTotalUserAnswers((prevTotalUserAnswers) => {
            const updatedTotalUserAnswers = { ...prevTotalUserAnswers };
            if (updatedTotalUserAnswers[usrData.id]) {
              updatedTotalUserAnswers[usrData.id] += 1;
            } else {
              updatedTotalUserAnswers[usrData.id] = 1;
            }
            return updatedTotalUserAnswers;
          });
        }
      });

      socket.on("update_user_count", (count) => {
        console.log(`Current user count in room ${room}: ${count}`);
      });
      socket.on("room_joined", (count) => {
        console.log(`current ppl join in room is ${count} `);
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("receive_users_answer");
      socket.off("user_joined");
    };
  }, [room, questionIndex]);

  console.log("the id is ", id);
  console.log("the prizeValue is ", prizeValue);
  console.log("the prizes is ", prizes);
  console.log("the prizes length is is ", prizes?.length);
  console.log("the key is ", key);

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      <h1 className="text-4xl font-bold mt-8 mb-12">Host Page</h1>
      <p className="text-2xl mb-1">Trivia ID: {room}</p>
      <button
        onClick={() => navigator.clipboard.writeText(room as string)}
        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mb-12"
      >
        Copy Room ID
      </button>

      {!quizStarted && countdown === 0 ? (
        <button
          onClick={startQuiz}
          className="px-6 py-3 bg-blue-500 text-white text-xl font-bold rounded-md hover:bg-blue-600 mt-4"
        >
          Start Quiz
        </button>
      ) : (
        <div>
          {countdown > 0 && (
            <h2 className="text-2xl mt-4">Starting in: {countdown}</h2>
          )}
          {quizStarted && (
            <div>
              <div>
                {!showAnswer && (
                  <div>
                    <h2 className="w-full p-2 mb-4 border border-gray-300 rounded-md text-center text-2xl">
                      {questions[questionIndex].text}
                    </h2>
                    <ul>
                      <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-4">
                        {questions[questionIndex].choices.map(
                          (choice, index) => (
                            <div
                              key={index}
                              className="w-full p-2 border border-gray-300 rounded-md text-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-white"
                            >
                              {choice}
                            </div>
                          )
                        )}
                      </div>
                    </ul>
                  </div>
                )}
              </div>
              {countdown !== 0 && (
                <h2 className="text-2xl mt-4">Time remaining: {countdown}</h2>
              )}

              {showAnswer && (
                <div className="mt-4">
                  <h3 className="text-xl text-center">
                    Answer: {questions[questionIndex].answer}
                  </h3>
                  <h3 className="text-xl mt-4">
                    Users who answered correctly:
                  </h3>
                  <ul>
                    {userAnswers.length > 0 ? (
                      userAnswers.map((user, index) => (
                        <li key={index}>
                          {/* {user.id.slice(0, 4)}...{user.id.slice(-4)}, Pt -{" "} */}
                          {user.id} - {user.point}
                        </li>
                      ))
                    ) : (
                      <li>No one answered.</li>
                    )}
                  </ul>
                  {questions.length > questionIndex + 1 && (
                    <div className="flex justify-center w-full">
                      <button
                        onClick={nextQuestion}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                  {questions.length == questionIndex + 1 && (
                    <div className="flex justify-center w-full">
                      <button
                        onClick={finishQuestion}
                        className="px-4 py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 mt-4"
                      >
                        Finish Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mt-12">
        {!quizStarted && (
          <div className="flex flex-wrap gap-2 p-4">
            {playerNames.map((name, index) => (
              <div
                key={index}
                className="bg-blue-500 text-white p-1 rounded-lg"
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {totalUserAnswers.length > 0 && (
          <h3 className="text-2xl">Total User Points:</h3>
        )}

        <ul>
          {Object.entries(totalUserAnswers).map(([userId, points], index) => (
            <li key={index}>
              {/* {userId.slice(0, 4)}...{userId.slice(-4)} : {points} points */}
              {userId} : {points} points
            </li>
          ))}
        </ul>
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
  );
};

export default HostPage;
