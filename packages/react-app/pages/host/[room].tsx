import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

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
  const { room } = router.query;

  const [message, setMessage] = useState<string>("");
  const [messageReceived, setMessageReceived] = useState<string>("");
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [question, setQuestion] = useState<Question>({
    text: "What is the capital of France?",
    choices: ["Paris", "Berlin", "Madrid", "Rome"],
    answer: "Paris",
  });
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [correctUsers, setCorrectUsers] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(0);

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
        startQuestionTimer();
      }
    }, 1000);
  };

  const startQuestionTimer = () => {
    let questionCountdown = 10;
    setCountdown(questionCountdown);

    socket.emit("send_question", { room, question });

    const questionInterval = setInterval(() => {
      questionCountdown -= 1;
      setCountdown(questionCountdown);
      if (questionCountdown <= 0) {
        clearInterval(questionInterval);
        setShowAnswer(true);
        socket.emit("show_answer", { room, answer: question.answer });
        checkAnswers();
      }
    }, 1000);
  };

  const checkAnswers = () => {
    const correctUsers = userAnswers
      .filter((userAnswer) => userAnswer.answer === question.answer)
      .map((userAnswer) => userAnswer.id);
    setCorrectUsers(correctUsers);
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
      socket.on("receive_users_answer", (data: UserAnswer) => {
        const point = data.answer === question.answer ? 1 : 0;
        const usrData = { ...data, point };
        setUserAnswers((prevUserAnswers) => [...prevUserAnswers, usrData]);
      });
    }

    return () => {
      socket.off("receive_message");
      socket.off("receive_users_answer");
    };
  }, [room]);

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-4xl font-bold mt-6 mb-12">Host Page</h1>
      <p className="text-2xl mb-4">Room ID: {room}</p>
      <button
        onClick={() => navigator.clipboard.writeText(room as string)}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Copy Room ID
      </button>
      <div>
        <input
          placeholder="Message..."
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}>Send Message</button>
        <h1>Message:</h1>
        {messageReceived}
      </div>
      {!quizStarted && countdown === 0 ? (
        <button
          onClick={startQuiz}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
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
              <h2 className="text-2xl mt-4">{question.text}</h2>
              <ul>
                {question.choices.map((choice, index) => (
                  <li key={index}>{choice}</li>
                ))}
              </ul>
              <h2 className="text-2xl mt-4">Time remaining: {countdown}</h2>
              {showAnswer && (
                <div className="mt-4">
                  <h3 className="text-xl">Answer: {question.answer}</h3>
                  <h3 className="text-xl mt-4">
                    Users who answered correctly:
                  </h3>
                  <ul>
                    {userAnswers.length > 0 ? (
                      userAnswers.map((user, index) => (
                        <li key={index}>
                          {user.id}, Pt - {user.point}
                        </li>
                      ))
                    ) : (
                      <li>No one answered.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostPage;
