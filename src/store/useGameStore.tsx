import { create } from "zustand";
import { Chess, Square } from "chess.js";
import { io } from "socket.io-client";

// Yardımcı tipler
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

// Yardımcı fonksiyonlar
const convertToChessNotation = (pos: number[]): string => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[pos[1]] + ranks[pos[0]];
};

const pieceTypeMap: Record<string, PieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

const convertPieceFromChess = (piece: any): Piece | null => {
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

const convertBoardFromChess = (chess: Chess): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = convertToChessNotation([y, x]) as Square;
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

const socket = io('http://localhost:3001');

interface GameState {
  chess: Chess;
  board: (Piece | null)[][];
  selectedPiece: { position: number[]; piece: Piece } | null;
  currentPlayer: PieceColor;
  moves: { from: number[]; to: number[] }[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
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
  selectPiece: (position: number[]) => void;
  movePiece: (from: number[], to: number[]) => void;
  initializeBoard: () => void;
  isValidMove: (from: number[], to: number[]) => boolean;
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

  selectPiece: (position) =>
    set((state) => {
      if (state.currentPlayer === "black" && !state.isMultiplayer) return state;
      
      const piece = state.board[position[0]][position[1]];
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
      if (
        (state.isMultiplayer && state.currentPlayer !== 'white') || 
        state.isCheckmate || 
        state.isStalemate
      ) {
        return state;
      }

      try {
        const fromSquare = convertToChessNotation(from);
        const toSquare = convertToChessNotation(to);

        const moveResult = state.chess.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });

        if (!moveResult) return state;

        const newBoard = convertBoardFromChess(state.chess);
        const newCapturedPieces = { ...state.capturedPieces };

        if (moveResult.captured) {
          const capturedPiece = {
            type: moveResult.captured,
            color: state.currentPlayer === "white" ? "black" : "white",
            hasMoved: true,
          };
          newCapturedPieces[state.currentPlayer === "white" ? "black" : "white"].push(
            capturedPiece
          );
        }

        if (state.isMultiplayer) {
          socket.emit('move', {
            roomId: state.roomId,
            move: { from: fromSquare, to: toSquare }
          });
        }

        const isInCheckmate = state.chess.isCheckmate();
        const isInStalemate = state.chess.isStalemate();
        const isInCheck = state.chess.inCheck();

        return {
          ...state,
          board: newBoard,
          selectedPiece: null,
          currentPlayer: state.isMultiplayer ? "black" : "white",
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
                message: `${state.currentPlayer === "white" ? "Beyaz" : "Siyah"} kazandı!`,
                type: "checkmate",
              }
            : isInCheck
            ? {
                isOpen: true,
                title: "♚ Şah!",
                message: `${state.currentPlayer === "white" ? "Siyah" : "Beyaz"} şah çekildi!`,
                type: "check",
              }
            : state.modalState,
        };
      } catch (error) {
        console.error("Invalid move:", error);
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
    })),

  isValidMove: (from, to) => {
    const state = get();
    const fromSquare = convertToChessNotation(from);
    const toSquare = convertToChessNotation(to);

    try {
      const moves = state.chess.moves({ square: fromSquare, verbose: true });
      return moves.some((move) => move.to === toSquare);
    } catch {
      return false;
    }
  },

  closeModal: () =>
    set((state) => ({
      ...state,
      modalState: { ...state.modalState, isOpen: false },
    })),

  createRoom: () => {
    socket.emit('createRoom');
    
    socket.on('roomCreated', (roomId: string) => {
      set({ 
        roomId, 
        isMultiplayer: true,
        currentPlayer: 'white'
      });
      console.log('Oda oluşturuldu:', roomId);
    });

    socket.on('gameStart', (gameData) => {
      console.log('Oyun başladı:', gameData);
    });

    socket.on('moveMade', (move) => {
      const state = get();
      try {
        const moveResult = state.chess.move(move);
        if (moveResult) {
          const newBoard = convertBoardFromChess(state.chess);
          set({ 
            board: newBoard,
            currentPlayer: 'white'
          });
        }
      } catch (error) {
        console.error('Geçersiz hamle:', error);
      }
    });
  },

  joinRoom: (roomId: string) => {
    socket.emit('joinRoom', roomId);

    socket.on('joinedRoom', () => {
      set({ 
        roomId, 
        isMultiplayer: true,
        currentPlayer: 'black'
      });
      console.log('Odaya katılındı:', roomId);
    });

    socket.on('joinError', (error) => {
      console.error('Odaya katılma hatası:', error);
    });
  },
}));