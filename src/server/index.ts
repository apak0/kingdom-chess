import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3001",
    "https://kingdom-of-harpoon.onrender.com/",
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3001",
      "https://kingdom-of-harpoon.onrender.com/",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2000,
    skipMiddlewares: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // For production, serve the client build files
  const clientDistPath = path.join(__dirname, "../../dist");
  console.log(`Serving static files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Send index.html for any route that doesn't match an API or static file
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

interface GameRoom {
  id: string;
  players: {
    white?: {
      id: string;
      nickname?: string;
    };
    black?: {
      id: string;
      nickname?: string;
    };
  };
  moves: any[];
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }>;
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
      players: { white: { id: socket.id } },
      moves: [],
      messages: [],
    });
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
    console.log("Room created:", roomId);
  });

  socket.on("joinRoom", (roomId: string) => {
    const room = gameRooms.get(roomId);
    if (room && !room.players.black) {
      room.players.black = { id: socket.id };
      socket.join(roomId);
      socket.emit("joinedRoom", roomId);

      // Beyaz oyuncunun nickname'i varsa, yeni katılan oyuncuya gönder
      if (room.players.white?.nickname) {
        socket.emit("nicknameSet", {
          nickname: room.players.white.nickname,
          color: "white",
        });
      }

      io.to(roomId).emit("gameStart", {
        white: room.players.white?.id,
        black: room.players.black.id,
      });
      console.log("Player joined room:", roomId);
    } else {
      socket.emit("joinError", "Oda bulunamadı veya dolu");
    }
  });

  // Nickname ayarlama eventi
  socket.on("setNickname", ({ roomId, nickname }) => {
    const room = gameRooms.get(roomId);
    if (room) {
      if (room.players.white?.id === socket.id) {
        room.players.white.nickname = nickname;
        io.to(roomId).emit("nicknameSet", {
          nickname,
          color: "white",
        });
      } else if (room.players.black?.id === socket.id) {
        room.players.black.nickname = nickname;
        io.to(roomId).emit("nicknameSet", {
          nickname,
          color: "black",
        });
      }
    }
  });

  // Chat mesajı eventi
  socket.on("chatMessage", ({ roomId, message }) => {
    const room = gameRooms.get(roomId);
    if (room) {
      room.messages.push(message);
      // Mesajı odadaki diğer oyuncuya ilet
      socket.to(roomId).emit("chatMessage", message);
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
        room.players.white?.id === socket.id ||
        room.players.black?.id === socket.id
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
