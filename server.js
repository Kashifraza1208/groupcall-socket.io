const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users = {};

io.on("connection", (socket) => {
  // When a new user connects
  users[socket.id] = socket;
  // Emit the user's ID to them
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.broadcast.emit("callEnded");
  });

  //when user want to call other user

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // Joining a room
  socket.on("joinRoom", (roomID) => {
    socket.join(roomID);
    // Inform others in the room about the new user
    socket.to(roomID).broadcast.emit("userJoined", socket.id);
  });

  // Broadcasting calls within a room
  socket.on("groupCall", (data) => {
    socket.to(data.room).emit("groupCall", {
      signal: data.signal,
      from: data.from,
      name: data.name,
    });
  });
});

server.listen(8000, () => console.log("server is running on port 8000"));
