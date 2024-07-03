import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

const HostPage = () => {
  const router = useRouter();
  const { roomId } = router.query;

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");
  const [room, setRoom] = useState("");

  const socket = io("http://localhost:3001", {
    auth: { isCreator: true },
  });

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    socket.emit("send_message", { message, room: roomId });
  };

  useEffect(() => {
    socket.emit("join_room", roomId);
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived(data.message);
    });
  }, [socket]);

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-4xl font-bold mt-6 mb-12">Host Page</h1>
      <p className="text-2xl mb-4">Room ID: {roomId}</p>
      <button
        onClick={() => navigator.clipboard.writeText(roomId as string)}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Copy Room ID
      </button>
      <div>
        <input
          placeholder="Room Number..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <button onClick={joinRoom}> Join Room</button>
      </div>
      <div>
        <input
          placeholder="Message..."
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}> Send Message</button>
        <h1> Message:</h1>
        {messageReceived}
      </div>
    </div>
  );
};

export default HostPage;
