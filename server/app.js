const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://celo-trivia.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const rooms = {};
const userCounts = {};
const userNames = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Authentication middleware (simplified for example)
  const isAuthenticated = (socket) => {
    // Implement your own authentication logic here
    // For example, check socket.handshake.auth for an auth token
    // Return true if authenticated as a creator, false otherwise
    return socket.handshake.auth && socket.handshake.auth.isCreator;
  };

  socket.on("create_room", (room) => {
    if (isAuthenticated(socket)) {
      rooms[room] = socket.id; // Store the creator's socket ID
      userCounts[room] = 0;
      userNames[room] = [];
      socket.join(room);
      console.log(`Room ${room} created by ${socket.id}`);
      socket.emit("room_created", room);
    } else {
      socket.emit("error", "Only creators can create rooms.");
    }
  });

  socket.on("check_room", (room) => {
    if (rooms[room]) {
      socket.emit("room_exists", room);
    } else {
      socket.emit("error", "Room does not exist.");
    }
  });

  socket.on("join_room", (room) => {
    if (rooms[room]) {
      userCounts[room] += 1;
      socket.join(room);
      console.log(
        `User ${socket.id} joined room ${room}, room count ${userCounts[room]}`
      );
      socket.emit("room_joined", userCounts[room]);
    } else {
      socket.emit("error", "Room does not exist.");
    }
  });

  socket.on("add_name", (data) => {
    const { room, name } = data;
    console.log("the name is ", name);
    if (!userNames[room]) {
      userNames[room] = [];
    }

    userNames[room].push(name);
    socket.to(room).emit("user_joined", userNames[room]);
  });

  socket.on("leave_room", (room) => {
    if (rooms[room]) {
      socket.leave(room);
      userCounts[room] -= 1;
      console.log(
        `User left room ${room}. Current user count: ${userCounts[room]}`
      );
      io.to(room).emit("update_user_count", userCounts[room]);
    } else {
      socket.emit("error", "Room does not exist.");
    }
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      if (rooms[room] === socket.id) {
        delete rooms[room];
        delete userCounts[room];
        console.log(`Room ${room} deleted as its creator disconnected.`);
        io.to(room).emit("room_deleted");
      }
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("start_quiz", (room) => {
    socket.to(room).emit("quiz_started");
  });

  socket.on("send_question", (data) => {
    const { room, question } = data;
    socket.to(room).emit("receive_question", question);
  });

  socket.on("show_answer", (data) => {
    const { room, answer } = data;
    socket.to(room).emit("receive_answer", answer);
  });

  socket.on("answer_question", (data) => {
    const { room, answer, name } = data;
    const userAnswer = { answer: answer, id: name };
    socket.to(room).emit("receive_users_answer", userAnswer);
  });

  socket.on("close_quiz", (data) => {
    const { room, winners, key, prizes } = data;
    const closeQuiz = { winners: winners, key: key, prizes: prizes };
    console.log("the close quiz data is ", closeQuiz);
    socket.to(room).emit("quiz_finished", closeQuiz);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
