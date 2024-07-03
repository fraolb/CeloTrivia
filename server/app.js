const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Example in-memory storage for room creators
const rooms = {};

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
      socket.join(room);
      console.log(`Room ${room} created by ${socket.id}`);
      socket.emit("room_created", room);
    } else {
      socket.emit("error", "Only creators can create rooms.");
    }
  });

  socket.on("join_room", (room) => {
    if (rooms[room]) {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      socket.emit("room_joined", room);
    } else {
      socket.emit("error", "Room does not exist.");
    }
  });

  socket.on("send_message", (data) => {
    console.log(`User ${socket.id} sent ${data.message}`);
    socket.to(data.room).emit("receive_message", data);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
