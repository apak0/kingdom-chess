import { create } from "zustand";
import { Chess, Square as ChessSquare } from "chess.js";
import { io } from "socket.io-client";
import { Piece as PieceType, PieceColor, Position } from "../types";

// Sound utilities
const playCaptureSound = () => {
  const audio = new Audio("/assets/capture.mp3");
  audio.volume = 0.5;
  audio.play().catch((err) => console.error("Ses çalma hatası:", err));
};

const playMoveSound = () => {
  const audio = new Audio("/assets/move-self.mp3");
  audio.volume = 0.5;
  audio.play().catch((err) => console.error("Ses çalma hatası:", err));
};

// Yardımcı fonksiyonlar
const convertToChessNotation = (pos: Position): string => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[pos.x] + ranks[pos.y];
};

const pieceTypeMap: Record<string, PieceType["type"]> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

// Type definitions for chess.js piece
interface ChessPiece {
  type: string;
  color: "w" | "b";
}

// Add type for chess.js move
interface ChessMove {
  to: string;
  from: string;
  color: "w" | "b";
  flags: string;
  piece: string;
  san: string;
  captured?: string;
}

const convertPieceFromChess = (piece: ChessPiece): PieceType | null => {
  if (!piece) return null;

  const type = pieceTypeMap[piece.type];
  if (!type) return null;

  const color: PieceColor = piece.color === "w" ? "white" : "black";
  return {
    type,
    color,
    hasMoved: true,
  };
};

const convertBoardFromChess = (chess: Chess): (PieceType | null)[][] => {
  const board: (PieceType | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = convertToChessNotation({ x, y }) as ChessSquare;
      const piece = chess.get(square);
      board[y][x] = piece ? convertPieceFromChess(piece as ChessPiece) : null;
    }
  }

  return board;
};

const findBestMove = (chess: Chess): string => {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return "";

  // Basit bir değerlendirme
  return moves[Math.floor(Math.random() * moves.length)].san;
};

// Socket.IO bağlantısı
const SERVER_URL =
  import.meta.env.USE_LOCAL_SERVER === "true"
    ? import.meta.env.VITE_SERVER_URL || "http://localhost:3001"
    : "https://kingdom-of-harpoon.onrender.com/";

console.log("Connecting to server:", SERVER_URL);

// Tek bir socket örneği oluştur ve bunu global olarak kullan
const socket = io(SERVER_URL, {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  forceNew: false, // Bunu false olarak ayarlıyorum, tekrar tekrar bağlantı oluşturmaması için
});

// Temel bağlantı durumu dinleyicileri
socket.on("connect", () => {
  console.log("Socket bağlantısı kuruldu:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket bağlantı hatası:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket bağlantısı kesildi:", reason);
});

interface GameState {
  chess: Chess;
  board: (PieceType | null)[];
  selectedPiece: { position: Position; piece: PieceType } | null;
  currentPlayer: PieceColor;
  moves: { from: Position; to: Position }[];
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
  isCheckmate: boolean;
  isStalemate: boolean;
  modalState: {
    isOpen: boolean;
    title: string;
    message: string;
    type: "check" | "checkmate" | "stalemate";
  };
  roomId: string | null;
  isMultiplayer: boolean;
  playerColor: PieceColor | null;
  playerNickname: string | null;
  opponentNickname: string | null;
  whitePlayerNickname: string | null;
  blackPlayerNickname: string | null;
  showNicknameModal: boolean;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }>;
  // Toast mesajlarını bir dizi olarak tutuyoruz
  toastMessages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }>;
  // Son hamle bilgisini tutacak yapı
  lastMove: {
    piece: PieceType | null;
    from: string;
    to: string;
    playerColor: PieceColor;
    playerName: string | null;
  } | null;
  selectPiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  initializeBoard: () => void;
  isValidMove: (from: Position, to: Position) => boolean;
  closeModal: () => void;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  setNickname: (nickname: string) => void;
  sendChatMessage: (text: string) => void;
  clearToastMessage: (id: string) => void;
  clearAllToastMessages: () => void;
}

// Socket olaylarını temizleme helper fonksiyonu
const cleanupSocketListeners = () => {
  socket.off("roomCreated");
  socket.off("joinedRoom");
  socket.off("joinError");
  socket.off("gameStart");
  socket.off("moveMade");
  socket.off("playerLeft");
  socket.off("nicknameSet");
  socket.off("chatMessage");
};

export const useGameStore = create<GameState>((set, get) => ({
  chess: new Chess(),
  board: convertBoardFromChess(new Chess()),
  selectedPiece: null,
  currentPlayer: "white" as PieceColor,
  moves: [],
  capturedPieces: {
    white: [],
    black: [],
  },
  isCheckmate: false,
  isStalemate: false,
  modalState: {
    isOpen: false,
    title: "",
    message: "",
    type: "check",
  },
  roomId: null,
  isMultiplayer: false,
  playerColor: null,
  playerNickname: null,
  opponentNickname: null,
  whitePlayerNickname: null,
  blackPlayerNickname: null,
  showNicknameModal: false,
  messages: [],
  toastMessages: [],
  lastMove: null,

  selectPiece: (position) =>
    set((state) => {
      // Oyun bittiyse seçim yapılmamalı
      if (state.isCheckmate || state.isStalemate) return state;

      // Multiplayer modunda oyuncular sadece kendi renklerini seçebilmeli
      if (state.isMultiplayer) {
        const piece = state.board[position.y][position.x];
        if (!piece || piece.color !== state.playerColor) return state;

        return {
          ...state,
          selectedPiece: {
            position,
            piece,
          },
        };
      }

      // Single player modunda sadece beyaz taşları seçebiliriz (AI siyah olduğu için)
      if (!state.isMultiplayer && state.currentPlayer === "black") return state;

      const piece = state.board[position.y][position.x];
      if (!piece || piece.color !== state.currentPlayer) return state;

      return {
        ...state,
        selectedPiece: {
          position,
          piece,
        },
      };
    }),

  movePiece: (from, to) =>
    set((state) => {
      // Oyun bittiyse hamle yapılamaz
      if (state.isCheckmate || state.isStalemate) {
        return state;
      }

      try {
        const fromSquare = convertToChessNotation(from);
        const toSquare = convertToChessNotation(to);

        // Hamleyi yapmadan önce kontrol: Doğru renkteki taşı mı hareket ettiriyoruz?
        const piece = state.board[from.y][from.x];
        if (!piece) {
          console.log("Taş bulunamadı:", from);
          return state;
        }

        // Multiplayer modunda, sadece kendi rengimizi ve sıramız geldiğinde hareket ettirebiliriz
        if (state.isMultiplayer) {
          if (piece.color !== state.playerColor) {
            console.log("Kendi taşınızı seçmelisiniz");
            return state;
          }

          // Eğer oyuncunun rengi ile current player uyuşmuyorsa hamle yapamaz
          if (state.playerColor !== state.currentPlayer) {
            console.log("Sıra sizde değil");
            return state;
          }
        } else if (piece.color !== state.currentPlayer) {
          // Tekli oyun modunda sadece sırası gelen oyuncu hamle yapabilir
          console.log("Sırası olmayan taşla hamle yapılamaz");
          return state;
        }

        const moveResult = state.chess.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });

        if (!moveResult) {
          console.log("Geçersiz hamle:", from, "->", to);
          return state;
        }

        // Ses efektlerini çal
        if (moveResult.captured) {
          playCaptureSound();
        } else {
          playMoveSound();
        }

        // Tahtayı ve yakalanan taşları güncelle
        const newBoard = convertBoardFromChess(state.chess);
        const newCapturedPieces = { ...state.capturedPieces };

        if (moveResult.captured) {
          const capturedType = pieceTypeMap[moveResult.captured];
          // Burada düzeltme yapıyorum: Beyaz taş siyah taşı yediğinde, yakalanan taş siyah olmalı
          // moveResult.color hamleyi yapan taşın rengidir, yakalanan taşın değil
          const capturedColor = moveResult.color === "w" ? "black" : "white";
          const capturedPiece: PieceType = {
            type: capturedType as PieceType["type"],
            color: capturedColor as PieceColor,
            hasMoved: true,
          };
          // Yakalanan taşlar doğru listeye eklenmeli
          newCapturedPieces[capturedColor].push(capturedPiece);

          // Debug bilgisi
          console.log("Taş yeme işlemi:", {
            hamleYapan: moveResult.color === "w" ? "beyaz" : "siyah",
            yakalananTaş: capturedType,
            yakalananRenk: capturedColor,
            yeniDurum: newCapturedPieces,
          });
        }

        // Multiplayer modunda hamleyi gönder
        if (state.isMultiplayer && state.roomId) {
          console.log("Hamle gönderiliyor:", {
            from: fromSquare,
            to: toSquare,
          });
          socket.emit("move", {
            roomId: state.roomId,
            move: { from: fromSquare, to: toSquare },
          });
        }

        // Şah/mat/pat durumlarını kontrol et
        const isInCheckmate = state.chess.isCheckmate();
        const isInStalemate = state.chess.isStalemate();
        const isInCheck = state.chess.inCheck();

        // Yeni state'i oluştur
        const newState = {
          ...state,
          board: newBoard,
          selectedPiece: null,
          // Multiplayer modunda sıra diğer oyuncuya geçer, tek oyunculuda ise AI hamlesi yapılacak
          currentPlayer:
            state.currentPlayer === "white"
              ? ("black" as PieceColor)
              : ("white" as PieceColor),
          moves: [...state.moves, { from, to }],
          capturedPieces: newCapturedPieces,
          isCheckmate: isInCheckmate,
          isStalemate: isInStalemate,
          modalState: isInStalemate
            ? {
                isOpen: true,
                title: "🤝 Pat!",
                message: "Oyun berabere bitti!",
                type: "stalemate" as const,
              }
            : isInCheckmate
            ? {
                isOpen: true,
                title: "♚ Şah Mat!",
                message: `${
                  state.currentPlayer === "white" ? "Beyaz" : "Siyah"
                } oyuncu kazandı!`,
                type: "checkmate" as const,
              }
            : isInCheck
            ? {
                isOpen: true,
                title: "♚ Şah!",
                message: `${
                  state.currentPlayer === "white" ? "Siyah" : "Beyaz"
                } şah çekildi!`,
                type: "check" as const,
              }
            : state.modalState,
          lastMove: {
            piece,
            from: fromSquare,
            to: toSquare,
            playerColor: state.currentPlayer,
            playerName: state.playerNickname,
          },
        };

        // Tek oyuncu modunda ve oyun bitmemişse AI hamlesi yap
        if (!state.isMultiplayer && !isInCheckmate && !isInStalemate) {
          setTimeout(() => {
            const bestMove = findBestMove(state.chess);
            if (bestMove) {
              const aiMoveResult = state.chess.move(bestMove);
              const aiBoard = convertBoardFromChess(state.chess);

              // AI hamlesi için ses efekti
              if (aiMoveResult.captured) {
                playCaptureSound();
              } else {
                playMoveSound();
              }

              if (aiMoveResult.captured) {
                const capturedType = pieceTypeMap[aiMoveResult.captured];
                const capturedColor =
                  aiMoveResult.color === "w" ? "black" : "white";
                const capturedPiece: PieceType = {
                  type: capturedType as PieceType["type"],
                  color: capturedColor as PieceColor,
                  hasMoved: true,
                };
                // AI'nin yakaladığı taşlar karşı tarafa eklenir
                newCapturedPieces[capturedColor].push(capturedPiece);
              }

              const playerInCheckmate = state.chess.isCheckmate();
              const playerInStalemate = state.chess.isStalemate();
              const playerInCheck = state.chess.inCheck();

              set({
                ...newState,
                board: aiBoard,
                currentPlayer: "white", // AI sonrası sıra yine oyuncuya (beyaz) geçer
                isCheckmate: playerInCheckmate,
                isStalemate: playerInStalemate,
                modalState: playerInStalemate
                  ? {
                      isOpen: true,
                      title: "🤝 Pat!",
                      message: "Oyun berabere bitti!",
                      type: "stalemate" as const,
                    }
                  : playerInCheckmate
                  ? {
                      isOpen: true,
                      title: "♚ Şah Mat!",
                      message: "Üzgünüm, AI sizi mat etti!",
                      type: "checkmate" as const,
                    }
                  : playerInCheck
                  ? {
                      isOpen: true,
                      title: "♚ Şah!",
                      message: "Beyaz şah çekildi!",
                      type: "check" as const,
                    }
                  : { ...state.modalState, isOpen: false },
              });
            }
          }, 1000);
        }

        return newState;
      } catch (error) {
        console.error("Hamle yapılırken hata:", error);
        return state;
      }
    }),

  initializeBoard: () => {
    // Socket event listener'larını temizle
    cleanupSocketListeners();

    // Oyunu sıfırla
    set({
      chess: new Chess(),
      board: convertBoardFromChess(new Chess()),
      selectedPiece: null,
      currentPlayer: "white",
      moves: [],
      capturedPieces: {
        white: [],
        black: [],
      },
      isCheckmate: false,
      isStalemate: false,
      modalState: {
        isOpen: false,
        title: "",
        message: "",
        type: "check",
      },
      roomId: null,
      isMultiplayer: false,
      playerColor: null,
      playerNickname: null,
      opponentNickname: null,
      whitePlayerNickname: null,
      blackPlayerNickname: null,
      showNicknameModal: false,
      messages: [],
      toastMessages: [],
      lastMove: null,
    });
  },

  isValidMove: (from, to) => {
    const state = get();
    const fromSquare = convertToChessNotation(from) as ChessSquare;
    const toSquare = convertToChessNotation(to) as ChessSquare;

    try {
      const moves = state.chess.moves({
        square: fromSquare,
        verbose: true,
      }) as ChessMove[];
      if (!Array.isArray(moves)) return false;
      return moves.some((move) => move.to === toSquare);
    } catch (error) {
      console.error("Hamle geçerliliği kontrol edilirken hata:", error);
      return false;
    }
  },

  closeModal: () =>
    set((state) => ({
      ...state,
      modalState: { ...state.modalState, isOpen: false },
    })),

  setNickname: (nickname: string) =>
    set((state) => {
      // Nickname'i kaydet ve socket'e gönder
      if (state.roomId) {
        socket.emit("setNickname", { roomId: state.roomId, nickname });
        console.log("Nickname set and sent to server:", nickname);
      }

      // Kendi rengimize göre nickname'i ayarla
      if (state.playerColor === "white") {
        return {
          ...state,
          playerNickname: nickname,
          whitePlayerNickname: nickname,
          showNicknameModal: false,
        };
      } else {
        return {
          ...state,
          playerNickname: nickname,
          blackPlayerNickname: nickname,
          showNicknameModal: false,
        };
      }
    }),

  sendChatMessage: (text: string) => {
    const state = get();
    if (!state.roomId || !state.playerNickname) return;

    const message = {
      id: crypto.randomUUID(),
      sender: state.playerNickname,
      text,
      timestamp: Date.now(),
    };

    // Mesajı socket üzerinden gönder
    socket.emit("chatMessage", {
      roomId: state.roomId,
      message,
    });

    console.log("Chat message sent:", message);

    // Mesajı local state'e ekle
    set((state) => ({
      ...state,
      messages: [...state.messages, message],
    }));
  },

  clearToastMessage: (id: string) =>
    set((state) => ({
      ...state,
      toastMessages: state.toastMessages.filter((message) => message.id !== id),
    })),

  clearAllToastMessages: () =>
    set((state) => ({
      ...state,
      toastMessages: [],
    })),

  createRoom: () => {
    // Önceki event listener'ları temizle
    cleanupSocketListeners();

    // Socket bağlantısını kontrol et
    if (!socket.connected) {
      console.log("Socket bağlantısı kurulmamış, yeniden bağlanılıyor...");
      socket.connect();
    }

    // Oda oluşturma isteği gönder
    socket.emit("createRoom");
    console.log("createRoom event emitted");

    // roomCreated eventi
    socket.on("roomCreated", (roomId: string) => {
      console.log("roomCreated event received:", roomId);
      set({
        chess: new Chess(),
        board: convertBoardFromChess(new Chess()),
        selectedPiece: null,
        currentPlayer: "white" as PieceColor,
        moves: [],
        capturedPieces: {
          white: [],
          black: [],
        },
        isCheckmate: false,
        isStalemate: false,
        roomId,
        isMultiplayer: true,
        playerColor: "white",
        modalState: {
          isOpen: false,
          title: "",
          message: "",
          type: "check",
        },
        showNicknameModal: true,
        toastMessages: [],
        lastMove: null,
      });
    });

    // Game start eventi
    socket.on("gameStart", (gameData) => {
      console.log("gameStart event received:", gameData);
      set((state) => ({
        ...state,
        modalState: {
          isOpen: true,
          title: "🎮 Oyun Başladı!",
          message: "Rakip odaya katıldı. Beyaz taş olarak başlıyorsunuz.",
          type: "check",
        },
      }));
    });

    // Move eventi
    socket.on("moveMade", (move) => {
      console.log("moveMade event received:", move);
      const state = get();
      try {
        const moveResult = state.chess.move(move);
        if (moveResult) {
          // Karşı oyuncunun hamlesi için ses efekti
          if (moveResult.captured) {
            playCaptureSound();
          } else {
            playMoveSound();
          }

          const newBoard = convertBoardFromChess(state.chess);
          const newCapturedPieces = { ...state.capturedPieces };

          if (moveResult.captured) {
            const capturedType = pieceTypeMap[moveResult.captured];
            // Burada düzeltme yapıyorum: Beyaz taş siyah taşı yediğinde, yakalanan taş siyah olmalı
            // moveResult.color hamleyi yapan taşın rengidir, yakalanan taşın değil
            const capturedColor = moveResult.color === "w" ? "black" : "white";
            const capturedPiece: PieceType = {
              type: capturedType as PieceType["type"],
              color: capturedColor as PieceColor,
              hasMoved: true,
            };
            // Yakalanan taşlar doğru listeye eklenmeli
            newCapturedPieces[capturedColor].push(capturedPiece);

            // Debug bilgisi
            console.log("Taş yeme işlemi:", {
              hamleYapan: moveResult.color === "w" ? "beyaz" : "siyah",
              yakalananTaş: capturedType,
              yakalananRenk: capturedColor,
              yeniDurum: newCapturedPieces,
            });
          }

          const isInCheckmate = state.chess.isCheckmate();
          const isInStalemate = state.chess.isStalemate();
          const isInCheck = state.chess.inCheck();

          set({
            board: newBoard,
            currentPlayer:
              state.currentPlayer === "white"
                ? ("black" as PieceColor)
                : ("white" as PieceColor),
            capturedPieces: newCapturedPieces,
            isCheckmate: isInCheckmate,
            isStalemate: isInStalemate,
            modalState: isInStalemate
              ? {
                  isOpen: true,
                  title: "🤝 Pat!",
                  message: "Oyun berabere bitti!",
                  type: "stalemate" as const,
                }
              : isInCheckmate
              ? {
                  isOpen: true,
                  title: "♚ Şah Mat!",
                  message: `${
                    state.currentPlayer === "white" ? "Beyaz" : "Siyah"
                  } oyuncu kazandı!`,
                  type: "checkmate" as const,
                }
              : isInCheck
              ? {
                  isOpen: true,
                  title: "♚ Şah!",
                  message: `${
                    state.currentPlayer === "white" ? "Siyah" : "Beyaz"
                  } şah çekildi!`,
                  type: "check" as const,
                }
              : { ...state.modalState, isOpen: false },
            lastMove: {
              piece: convertPieceFromChess({
                type: moveResult.piece,
                color: moveResult.color,
              }),
              from: move.from,
              to: move.to,
              playerColor: moveResult.color === "w" ? "white" : "black",
              playerName:
                moveResult.color === "w"
                  ? state.whitePlayerNickname
                  : state.blackPlayerNickname,
            },
          });
        }
      } catch (error) {
        console.error("Geçersiz hamle:", error);
      }
    });

    // Player left eventi
    socket.on("playerLeft", () => {
      console.log("playerLeft event received");
      set((state) => ({
        ...state,
        modalState: {
          isOpen: true,
          title: "⚠️ Rakip Ayrıldı",
          message: "Rakip oyundan ayrıldı.",
          type: "check",
        },
      }));

      // Multiplayer modunu kapat
      setTimeout(() => {
        cleanupSocketListeners();
        set({
          chess: new Chess(),
          board: convertBoardFromChess(new Chess()),
          selectedPiece: null,
          currentPlayer: "white" as PieceColor,
          moves: [],
          capturedPieces: {
            white: [],
            black: [],
          },
          isCheckmate: false,
          isStalemate: false,
          modalState: {
            isOpen: false,
            title: "",
            message: "",
            type: "check",
          },
          roomId: null,
          isMultiplayer: false,
          playerColor: null,
          playerNickname: null,
          opponentNickname: null,
          whitePlayerNickname: null,
          blackPlayerNickname: null,
          showNicknameModal: false,
          messages: [],
          toastMessages: [],
          lastMove: null,
        });
      }, 3000);
    });

    // nicknameSet eventi
    socket.on("nicknameSet", ({ nickname, color }) => {
      console.log("nicknameSet event received:", nickname, color);
      set((state) => ({
        ...state,
        whitePlayerNickname:
          color === "white" ? nickname : state.whitePlayerNickname,
        blackPlayerNickname:
          color === "black" ? nickname : state.blackPlayerNickname,
        opponentNickname:
          color !== state.playerColor ? nickname : state.opponentNickname,
      }));
    });

    // chatMessage eventi
    socket.on("chatMessage", (message) => {
      console.log("chatMessage event received:", message);
      const state = get();

      // Mesajın daha önce eklenip eklenmediğini kontrol et
      const messageExists = state.messages.some((m) => m.id === message.id);
      if (!messageExists) {
        // Eğer gelen mesaj karşı taraftan geliyorsa toast mesajı göster
        if (message.sender !== state.playerNickname) {
          set((state) => {
            // Maksimum 2 toast mesajı göster, yeni mesaj eklendiğinde en eskisi çıkar (FIFO)
            const updatedToasts = [message, ...state.toastMessages].slice(0, 2);

            return {
              ...state,
              messages: [...state.messages, message],
              toastMessages: updatedToasts,
            };
          });
        } else {
          set((state) => ({
            ...state,
            messages: [...state.messages, message],
          }));
        }
      }
    });
  },

  joinRoom: (roomId: string) => {
    // Önceki event listener'ları temizle
    cleanupSocketListeners();

    // Socket bağlantısını kontrol et
    if (!socket.connected) {
      console.log("Socket bağlantısı kurulmamış, yeniden bağlanılıyor...");
      socket.connect();
    }

    console.log("Attempting to join room:", roomId);

    // Deep link ile gelip gelmediğini anlamak için flag
    const isDeepLink = window.location.search.includes("room=");

    // Odaya başarıyla katıldığımızı takip edecek değişken
    let hasJoinedRoom = false;

    // Odaya katılma isteği gönder
    socket.emit("joinRoom", roomId);

    // joinedRoom eventi
    socket.on("joinedRoom", () => {
      console.log("joinedRoom event received for room:", roomId);
      hasJoinedRoom = true; // Başarıyla katıldığımızı işaretle

      set({
        chess: new Chess(),
        board: convertBoardFromChess(new Chess()),
        selectedPiece: null,
        currentPlayer: "white" as PieceColor,
        moves: [],
        capturedPieces: {
          white: [],
          black: [],
        },
        isCheckmate: false,
        isStalemate: false,
        roomId,
        isMultiplayer: true,
        playerColor: "black",
        modalState: {
          isOpen: false,
          title: "",
          message: "",
          type: "check",
        },
        showNicknameModal: true,
        toastMessages: [],
        lastMove: null,
      });
    });

    // joinError eventi - sadece deep link ile gelmediysek ve henüz başarıyla katılmadıysak hata göster
    socket.on("joinError", (error) => {
      console.error("joinError event received:", error);

      // Eğer başarıyla katıldıysak veya deep link ile geldiysek hatayı gösterme
      if (hasJoinedRoom || isDeepLink) {
        console.log(
          "Hata gösterilmiyor çünkü:",
          hasJoinedRoom ? "zaten katılındı" : "deep link ile gelindi"
        );
        return;
      }

      set((state) => ({
        ...state,
        modalState: {
          isOpen: true,
          title: "⚠️ Hata",
          message: "Odaya katılınamadı: " + error,
          type: "check",
        },
      }));
    });

    // moveMade eventi
    socket.on("moveMade", (move) => {
      console.log("moveMade event received:", move);
      const state = get();
      try {
        const moveResult = state.chess.move(move);
        if (moveResult) {
          // Karşı oyuncunun hamlesi için ses efekti
          if (moveResult.captured) {
            playCaptureSound();
          } else {
            playMoveSound();
          }

          const newBoard = convertBoardFromChess(state.chess);
          const newCapturedPieces = { ...state.capturedPieces };

          if (moveResult.captured) {
            const capturedType = pieceTypeMap[moveResult.captured];
            // Burada düzeltme yapıyorum: Beyaz taş siyah taşı yediğinde, yakalanan taş siyah olmalı
            // moveResult.color hamleyi yapan taşın rengidir, yakalanan taşın değil
            const capturedColor = moveResult.color === "w" ? "black" : "white";
            const capturedPiece: PieceType = {
              type: capturedType as PieceType["type"],
              color: capturedColor as PieceColor,
              hasMoved: true,
            };
            // Yakalanan taşlar doğru listeye eklenmeli
            newCapturedPieces[capturedColor].push(capturedPiece);

            // Debug bilgisi
            console.log("Taş yeme işlemi:", {
              hamleYapan: moveResult.color === "w" ? "beyaz" : "siyah",
              yakalananTaş: capturedType,
              yakalananRenk: capturedColor,
              yeniDurum: newCapturedPieces,
            });
          }

          const isInCheckmate = state.chess.isCheckmate();
          const isInStalemate = state.chess.isStalemate();
          const isInCheck = state.chess.inCheck();

          set({
            board: newBoard,
            currentPlayer:
              state.currentPlayer === "white"
                ? ("black" as PieceColor)
                : ("white" as PieceColor),
            capturedPieces: newCapturedPieces,
            isCheckmate: isInCheckmate,
            isStalemate: isInStalemate,
            modalState: isInStalemate
              ? {
                  isOpen: true,
                  title: "🤝 Pat!",
                  message: "Oyun berabere bitti!",
                  type: "stalemate" as const,
                }
              : isInCheckmate
              ? {
                  isOpen: true,
                  title: "♚ Şah Mat!",
                  message: `${
                    state.currentPlayer === "white" ? "Beyaz" : "Siyah"
                  } oyuncu kazandı!`,
                  type: "checkmate" as const,
                }
              : isInCheck
              ? {
                  isOpen: true,
                  title: "♚ Şah!",
                  message: `${
                    state.currentPlayer === "white" ? "Siyah" : "Beyaz"
                  } şah çekildi!`,
                  type: "check" as const,
                }
              : { ...state.modalState, isOpen: false },
            lastMove: {
              piece: convertPieceFromChess({
                type: moveResult.piece,
                color: moveResult.color,
              }),
              from: move.from,
              to: move.to,
              playerColor: moveResult.color === "w" ? "white" : "black",
              playerName:
                moveResult.color === "w"
                  ? state.whitePlayerNickname
                  : state.blackPlayerNickname,
            },
          });
        }
      } catch (error) {
        console.error("Geçersiz hamle:", error);
      }
    });

    // playerLeft eventi
    socket.on("playerLeft", () => {
      console.log("playerLeft event received");
      set((state) => ({
        ...state,
        modalState: {
          isOpen: true,
          title: "⚠️ Rakip Ayrıldı",
          message: "Rakip oyundan ayrıldı.",
          type: "check",
        },
      }));

      // Multiplayer modunu kapat
      setTimeout(() => {
        cleanupSocketListeners();
        set({
          chess: new Chess(),
          board: convertBoardFromChess(new Chess()),
          selectedPiece: null,
          currentPlayer: "white" as PieceColor,
          moves: [],
          capturedPieces: {
            white: [],
            black: [],
          },
          isCheckmate: false,
          isStalemate: false,
          modalState: {
            isOpen: false,
            title: "",
            message: "",
            type: "check",
          },
          roomId: null,
          isMultiplayer: false,
          playerColor: null,
          playerNickname: null,
          opponentNickname: null,
          whitePlayerNickname: null,
          blackPlayerNickname: null,
          showNicknameModal: false,
          messages: [],
          toastMessages: [],
          lastMove: null,
        });
      }, 3000);
    });

    // nicknameSet eventi
    socket.on("nicknameSet", ({ nickname, color }) => {
      console.log("nicknameSet event received:", nickname, color);
      set((state) => ({
        ...state,
        whitePlayerNickname:
          color === "white" ? nickname : state.whitePlayerNickname,
        blackPlayerNickname:
          color === "black" ? nickname : state.blackPlayerNickname,
        opponentNickname:
          color !== state.playerColor ? nickname : state.opponentNickname,
      }));
    });

    // chatMessage eventi
    socket.on("chatMessage", (message) => {
      console.log("chatMessage event received:", message);
      const state = get();

      // Mesajın daha önce eklenip eklenmediğini kontrol et
      const messageExists = state.messages.some((m) => m.id === message.id);
      if (!messageExists) {
        // Eğer gelen mesaj karşı taraftan geliyorsa toast mesajı göster
        if (message.sender !== state.playerNickname) {
          set((state) => {
            // Maksimum 2 toast mesajı göster, yeni mesaj eklendiğinde en eskisi çıkar (FIFO)
            const updatedToasts = [message, ...state.toastMessages].slice(0, 2);

            return {
              ...state,
              messages: [...state.messages, message],
              toastMessages: updatedToasts,
            };
          });
        } else {
          set((state) => ({
            ...state,
            messages: [...state.messages, message],
          }));
        }
      }
    });
  },
}));
