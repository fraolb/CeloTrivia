import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: { isCreator: true },
});

const HostPage = () => {
  const router = useRouter();
  const { room } = router.query;

  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [question, setQuestion] = useState({
    text: "What is the capital of France?",
    choices: ["Paris", "Berlin", "Madrid", "Rome"],
    answer: "Paris",
  });
  const [showAnswer, setShowAnswer] = useState(false);

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  const startQuiz = () => {
    socket.emit("start_quiz", room);
    setTimeout(() => {
      setQuizStarted(true);
      socket.emit("send_question", { room, question });
      setTimeout(() => {
        setShowAnswer(true);
        socket.emit("show_answer", { room, answer: question.answer });
      }, 20000); // Show answer after 20 seconds
    }, 5000); // Start quiz after 5 seconds countdown
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
    }
  }, [socket]);

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
      {!quizStarted ? (
        <button
          onClick={startQuiz}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
        >
          Start Quiz
        </button>
      ) : (
        <div>
          <h2 className="text-2xl mt-4">{question.text}</h2>
          <ul>
            {question.choices.map((choice, index) => (
              <li key={index}>{choice}</li>
            ))}
          </ul>
          {showAnswer && (
            <div className="mt-4">
              <h3 className="text-xl">Answer: {question.answer}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostPage;
