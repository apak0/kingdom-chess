import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Production'da client URL'nize göre sınırlandırın
  methods: ["GET", "POST"]
  },
});

interface GameRoom {
  id: string;
  players: {
    white?: string;
    black?: string;
  };
  moves: any[];
}


io.engine.on("headers", (headers: any) => {
  headers["Access-Control-Allow-Origin"] = "*";
}); // Socket.IO 3.x+ kullanıyorsanız
const gameRooms = new Map<string, GameRoom>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    gameRooms.set(roomId, {
      id: roomId,
      players: { white: socket.id },
      moves: [],
    });
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
    console.log("Room created:", roomId);
  });

  socket.on("joinRoom", (roomId: string) => {
    const room = gameRooms.get(roomId);
    if (room && !room.players.black) {
      room.players.black = socket.id;
      socket.join(roomId);
      socket.emit("joinedRoom", roomId);
      io.to(roomId).emit("gameStart", {
        white: room.players.white,
        black: room.players.black,
      });
      console.log("Player joined room:", roomId);
    } else {
      socket.emit("joinError", "Oda bulunamadı veya dolu");
    }
  });

  socket.on("move", ({ roomId, move }) => {
    const room = gameRooms.get(roomId);
    if (room) {
      room.moves.push(move);
      socket.to(roomId).emit("moveMade", move);
      console.log("Move made in room:", roomId, move);
    }
  });

  socket.on("disconnect", () => {
    gameRooms.forEach((room, roomId) => {
      if (
        room.players.white === socket.id ||
        room.players.black === socket.id
      ) {
        io.to(roomId).emit("playerLeft");
        gameRooms.delete(roomId);
        console.log("Player left, room deleted:", roomId);
      }
    });
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
