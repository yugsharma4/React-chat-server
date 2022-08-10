const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = 4500 || process.env.PORT;

const users = [{}];

app.use(cors());

app.get("/", (req, res) => {
  res.send("It's working...");
});

const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {
  // console.log("New Connection");

  //When User joined
  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    // console.log(`${user} has joined!!!`);

    //To send message when new member joined the group chat
    //Message will be sent to every member of group except the one who joined
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });

    //For all users who joined the chat
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the Chat, ${users[socket.id]}!!`,
    });
  });

  //When user disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} left the chat`,
    });

    // console.log(`${users[socket.id]} left the chat`);
  });

  //Chat
  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}...`);
});
