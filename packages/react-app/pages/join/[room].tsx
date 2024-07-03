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
  const [answer, setAnswer] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessages) => [...prevMessages, data.message]);
    });

    socket.on("receive_question", (question) => {
      setQuestion(question);
      setAnswer(""); // Clear previous answer
    });

    socket.on("receive_answer", (answer) => {
      setAnswer(answer);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_question");
      socket.off("receive_answer");
    };
  }, []);

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }
  }, [room]);

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
      {question && (
        <div>
          <h2>{question.text}</h2>
          <ul>
            {question.choices.map((choice, index) => (
              <li key={index}>{choice}</li>
            ))}
          </ul>
          {answer && <h3>Answer: {answer}</h3>}
        </div>
      )}
    </div>
  );
}

export default Room;
