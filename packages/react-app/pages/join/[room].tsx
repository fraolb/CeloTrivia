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

  const [message, setMessage] = useState<string>("");
  const [messageReceived, setMessageReceived] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [yourAnswer, setYourAnswer] = useState<string>("");
  const [clickable, setClickable] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  const submitAnswer = (choice: string) => {
    setYourAnswer(choice);
    socket.emit("answer_question", { room, answer: choice });
    setClickable(false);
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
    <div className="App">
      <div>
        <input
          placeholder="Message..."
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <h1>Message:</h1>
      {messageReceived.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
      {answer === "" && question && (
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
      <div className="w-full p-2 mb-4 text-center text-2xl">
        {countdown > 0 && <p>Time remaining: {countdown}</p>}
      </div>
      <div>
        {answer !== "" && yourAnswer !== answer ? (
          <div className="w-full p-2 mb-4 text-center text-red-500 text-2xl">
            Ooops, wrong answer.
          </div>
        ) : (
          <div className="w-full p-2 mb-4 text-center text-green-500 text-2xl">
            You are correct!
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
