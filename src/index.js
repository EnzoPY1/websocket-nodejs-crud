import express from "express";
import { Server as WebSocketServer } from "socket.io";
import http from "http";
import { v4 as uuid } from "uuid";

let notes = [];

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server);

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.emit("server:loadnotes", notes);

  socket.on("client:newnote", (newNote) => {
    const note = { ...newNote, id: uuid() };
    notes.push(note);
    io.emit("server:newnote", note);
  });

  socket.on("client:deletenote", (noteId) => {
    notes = notes.filter((note) => note.id !== noteId);
    io.emit("server:loadnotes", notes);
  });

  socket.on("client:getnote", (noteId) => {
    const note = notes.find((note) => note.id === noteId);
    socket.emit("server:selectednote", note);   //socket es para un solo cliente
  });

  socket.on("client:updatenote", (updatedNote) => {
    notes = notes.map((note) => {
      if (note.id === updatedNote.id) {
        note.title = updatedNote.title;
        note.description = updatedNote.description;
      }
      return note;
    });
    io.emit("server:loadnotes", notes); //io es para mandar a todos los clientes
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
