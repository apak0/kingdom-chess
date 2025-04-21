import { create } from "zustand";
import { Chess, Square as ChessSquare } from "chess.js";
import { io } from "socket.io-client";
import { Piece as PieceType, PieceColor, Position } from "../types";

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

const convertPieceFromChess = (piece: any): PieceType | null => {
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
      board[y][x] = piece ? convertPieceFromChess(piece) : null;
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
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
console.log("Connecting to server:", SERVER_URL);

const socket = io(SERVER_URL, {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true,
});

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
  board: (PieceType | null)[][];
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
  selectPiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  initializeBoard: () => void;
  isValidMove: (from: Position, to: Position) => boolean;
  closeModal: () => void;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
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

        // Tahtayı ve yakalanan taşları güncelle
        const newBoard = convertBoardFromChess(state.chess);
        const newCapturedPieces = { ...state.capturedPieces };

        if (moveResult.captured) {
          const capturedType = pieceTypeMap[moveResult.captured];
          const capturedPiece = {
            type: capturedType,
            color: state.currentPlayer === "white" ? "black" : "white",
            hasMoved: true,
          };
          newCapturedPieces[
            state.currentPlayer === "white" ? "black" : "white"
          ].push(capturedPiece);
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
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
          moves: [...state.moves, { from, to }],
          capturedPieces: newCapturedPieces,
          isCheckmate: isInCheckmate,
          isStalemate: isInStalemate,
          modalState: isInStalemate
            ? {
                isOpen: true,
                title: "🤝 Pat!",
                message: "Oyun berabere bitti!",
                type: "stalemate",
              }
            : isInCheckmate
            ? {
                isOpen: true,
                title: "♚ Şah Mat!",
                message: `${
                  state.currentPlayer === "white" ? "Beyaz" : "Siyah"
                } oyuncu kazandı!`,
                type: "checkmate",
              }
            : isInCheck
            ? {
                isOpen: true,
                title: "♚ Şah!",
                message: `${
                  state.currentPlayer === "white" ? "Siyah" : "Beyaz"
                } şah çekildi!`,
                type: "check",
              }
            : state.modalState,
        };

        // Tek oyuncu modunda ve oyun bitmemişse AI hamlesi yap
        if (!state.isMultiplayer && !isInCheckmate && !isInStalemate) {
          setTimeout(() => {
            const bestMove = findBestMove(state.chess);
            if (bestMove) {
              const aiMoveResult = state.chess.move(bestMove);
              const aiBoard = convertBoardFromChess(state.chess);

              if (aiMoveResult.captured) {
                const capturedType = pieceTypeMap[aiMoveResult.captured];
                const capturedPiece = {
                  type: capturedType,
                  color: "white",
                  hasMoved: true,
                };
                newCapturedPieces.white = [
                  ...newCapturedPieces.white,
                  capturedPiece,
                ];
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
                      type: "stalemate",
                    }
                  : playerInCheckmate
                  ? {
                      isOpen: true,
                      title: "♚ Şah Mat!",
                      message: "Üzgünüm, AI sizi mat etti!",
                      type: "checkmate",
                    }
                  : playerInCheck
                  ? {
                      isOpen: true,
                      title: "♚ Şah!",
                      message: "Beyaz şah çekildi!",
                      type: "check",
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

  initializeBoard: () =>
    set(() => ({
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
    })),

  isValidMove: (from, to) => {
    const state = get();
    const fromSquare = convertToChessNotation(from);
    const toSquare = convertToChessNotation(to);

    try {
      const moves = state.chess.moves({ square: fromSquare, verbose: true });
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

  createRoom: () => {
    // Önceki event listener'ları temizle
    socket.off("roomCreated");
    socket.off("gameStart");
    socket.off("moveMade");
    socket.off("playerLeft");

    // Oda oluşturma isteği gönder
    socket.emit("createRoom");

    // Yeni event listener'ları ekle
    socket.on("roomCreated", (roomId: string) => {
      set({
        chess: new Chess(), // Yeni oyun başlat
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
        roomId,
        isMultiplayer: true,
        playerColor: "white",
        modalState: {
          isOpen: true,
          title: "✅ Oda Oluşturuldu",
          message: `Oda kodu: ${roomId}. Rakibinizin katılmasını bekleyin.`,
          type: "check",
        },
      });
      console.log("Oda oluşturuldu:", roomId);
    });

    socket.on("gameStart", (gameData) => {
      console.log("Oyun başladı:", gameData);
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

    socket.on("moveMade", (move) => {
      console.log("Beyaz oyuncu için hamle alındı:", move);
      const state = get();
      try {
        // Chess.js hamle formatına çevir
        const moveResult = state.chess.move(move);
        if (moveResult) {
          const newBoard = convertBoardFromChess(state.chess);

          // Eğer taş alındıysa yakalanan taşları güncelle
          const newCapturedPieces = { ...state.capturedPieces };
          if (moveResult.captured) {
            const capturedType = pieceTypeMap[moveResult.captured];
            const capturedPiece = {
              type: capturedType,
              color: "white",
              hasMoved: true,
            };
            newCapturedPieces.white = [
              ...newCapturedPieces.white,
              capturedPiece,
            ];
          }

          const isInCheckmate = state.chess.isCheckmate();
          const isInStalemate = state.chess.isStalemate();
          const isInCheck = state.chess.inCheck();

          set({
            board: newBoard,
            currentPlayer: "white", // Sıra beyaz oyuncuya geçer
            capturedPieces: newCapturedPieces,
            isCheckmate: isInCheckmate,
            isStalemate: isInStalemate,
            modalState: isInStalemate
              ? {
                  isOpen: true,
                  title: "🤝 Pat!",
                  message: "Oyun berabere bitti!",
                  type: "stalemate",
                }
              : isInCheckmate
              ? {
                  isOpen: true,
                  title: "♚ Şah Mat!",
                  message: "Siyah oyuncu kazandı!",
                  type: "checkmate",
                }
              : isInCheck
              ? {
                  isOpen: true,
                  title: "♚ Şah!",
                  message: "Beyaz şah çekildi!",
                  type: "check",
                }
              : { ...state.modalState, isOpen: false },
          });
        }
      } catch (error) {
        console.error("Geçersiz hamle:", error);
      }
    });

    socket.on("playerLeft", () => {
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
        });
      }, 3000);
    });
  },

  joinRoom: (roomId: string) => {
    // Önceki event listener'ları temizle
    socket.off("joinedRoom");
    socket.off("joinError");
    socket.off("gameStart");
    socket.off("moveMade");
    socket.off("playerLeft");

    // Odaya katılma isteği gönder
    socket.emit("joinRoom", roomId);

    // Yeni event listener'ları ekle
    socket.on("joinedRoom", () => {
      set({
        chess: new Chess(), // Yeni oyun başlat
        board: convertBoardFromChess(new Chess()),
        selectedPiece: null,
        currentPlayer: "white", // İlk olarak beyaz başlar, ancak bizim rengimiz siyah
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
          isOpen: true,
          title: "🎮 Oyuna Katıldınız!",
          message: "Siyah taş olarak oynuyorsunuz. Beyazın hamlesini bekleyin.",
          type: "check",
        },
      });
      console.log("Odaya katılındı:", roomId);
    });

    socket.on("joinError", (error) => {
      console.error("Odaya katılma hatası:", error);
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

    socket.on("moveMade", (move) => {
      console.log("Siyah oyuncu için hamle alındı:", move);
      const state = get();
      try {
        // Chess.js hamle formatına çevir
        const moveResult = state.chess.move(move);
        if (moveResult) {
          const newBoard = convertBoardFromChess(state.chess);

          // Eğer taş alındıysa yakalanan taşları güncelle
          const newCapturedPieces = { ...state.capturedPieces };
          if (moveResult.captured) {
            const capturedType = pieceTypeMap[moveResult.captured];
            const capturedPiece = {
              type: capturedType,
              color: "black",
              hasMoved: true,
            };
            newCapturedPieces.black = [
              ...newCapturedPieces.black,
              capturedPiece,
            ];
          }

          const isInCheckmate = state.chess.isCheckmate();
          const isInStalemate = state.chess.isStalemate();
          const isInCheck = state.chess.inCheck();

          set({
            board: newBoard,
            currentPlayer: "black", // Sıra siyah oyuncuya geçer
            capturedPieces: newCapturedPieces,
            isCheckmate: isInCheckmate,
            isStalemate: isInStalemate,
            modalState: isInStalemate
              ? {
                  isOpen: true,
                  title: "🤝 Pat!",
                  message: "Oyun berabere bitti!",
                  type: "stalemate",
                }
              : isInCheckmate
              ? {
                  isOpen: true,
                  title: "♚ Şah Mat!",
                  message: "Beyaz oyuncu kazandı!",
                  type: "checkmate",
                }
              : isInCheck
              ? {
                  isOpen: true,
                  title: "♚ Şah!",
                  message: "Siyah şah çekildi!",
                  type: "check",
                }
              : { ...state.modalState, isOpen: false },
          });
        }
      } catch (error) {
        console.error("Geçersiz hamle:", error);
      }
    });

    socket.on("playerLeft", () => {
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
        });
      }, 3000);
    });
  },
}));
