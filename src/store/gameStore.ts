import { create } from "zustand";
import { Chess, Square, Piece as ChessPiece } from "chess.js";
import { Piece, Position, Move, PieceType, PieceColor } from "../types";

interface GameState {
  chess: Chess;
  board: (Piece | null)[][];
  selectedPiece: Position | null;
  currentPlayer: "white" | "black";
  moves: Move[];
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
  selectPiece: (position: Position | null) => void;
  movePiece: (from: Position, to: Position) => void;
  initializeBoard: () => void;
  isValidMove: (from: Position, to: Position) => boolean;
  closeModal: () => void;
}

const convertToChessNotation = (pos: Position): string => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[pos.x] + ranks[pos.y];
};

const pieceTypeMap: Record<string, PieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

const convertPieceFromChess = (piece: ChessPiece | null): Piece | null => {
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
      const square = convertToChessNotation({ x, y }) as Square;
      const piece = chess.get(square);
      board[y][x] = piece ? convertPieceFromChess(piece) : null;
    }
  }

  return board;
};

const findBestMove = (chess: Chess): string => {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return "";

  // Evaluate each move
  const moveScores = moves.map((move) => {
    const newChess = new Chess(chess.fen());
    newChess.move(move);

    let score = 0;

    // Material value
    const pieces = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    // Count material
    const board = newChess.board();
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece) {
          const value = pieces[piece.type as keyof typeof pieces];
          score += piece.color === "b" ? value : -value;
        }
      }
    }

    // Bonus for captures
    if (move.captured) {
      score += pieces[move.captured as keyof typeof pieces] * 1.2;
    }

    // Bonus for center control (e4, d4, e5, d5)
    const centerSquares = ["e4", "d4", "e5", "d5"];
    if (centerSquares.includes(move.to)) {
      score += 0.3;
    }

    // Bonus for check
    if (newChess.inCheck()) {
      score += 0.5;
    }

    // Add randomness
    score += Math.random() * 0.2;

    return { move, score };
  });

  // Find best move
  moveScores.sort((a, b) => b.score - a.score);
  return moveScores[0].move.san;
};

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

  selectPiece: (position) =>
    set((state) => {
      if (state.currentPlayer === "black") {
        return state;
      }
      return { ...state, selectedPiece: position };
    }),

  movePiece: (from, to) =>
    set((state) => {
      if (state.currentPlayer === "black") return state;

      try {
        const fromSquare = convertToChessNotation(from) as Square;
        const toSquare = convertToChessNotation(to) as Square;

        const moveResult = state.chess.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });

        if (!moveResult) return state;

        const newBoard = convertBoardFromChess(state.chess);
        const newCapturedPieces = { ...state.capturedPieces };

        // Handle player's captured pieces
        if (moveResult.captured) {
          const capturedPiece: Piece = {
            type: pieceTypeMap[moveResult.captured],
            color: "black" as PieceColor,
            hasMoved: true,
          };
          newCapturedPieces.black = [...newCapturedPieces.black, capturedPiece];
        }

        const isInCheck = state.chess.inCheck();
        const isInCheckmate = state.chess.isCheckmate();
        const isInStalemate = state.chess.isStalemate();

        // Update state with check/checkmate/stalemate status
        const newState: GameState = {
          ...state,
          board: newBoard,
          selectedPiece: null,
          currentPlayer: "black",
          moves: [...state.moves, { from, to }],
          capturedPieces: newCapturedPieces,
          isCheckmate: isInCheckmate,
          isStalemate: isInStalemate,
          modalState: isInStalemate
            ? {
                isOpen: true,
                title: "🤝 Pat!",
                message:
                  "Oyun berabere bitti! Siyah oyuncu yasal hamle yapamıyor.",
                type: "stalemate",
              }
            : isInCheck
            ? {
                isOpen: true,
                title: "♚ Şah!",
                message: "Siyah şah çekildi!",
                type: "check",
              }
            : state.modalState,
        };

        // Handle AI move with delay if game is not over
        if (!isInCheckmate && !isInStalemate) {
          setTimeout(() => {
            const bestMove = findBestMove(state.chess);
            if (bestMove) {
              const aiMoveResult = state.chess.move(bestMove);
              const aiBoard = convertBoardFromChess(state.chess);

              if (aiMoveResult.captured) {
                const capturedPiece: Piece = {
                  type: pieceTypeMap[aiMoveResult.captured],
                  color: "white" as PieceColor,
                  hasMoved: true,
                };
                newCapturedPieces.white = [
                  ...newCapturedPieces.white,
                  capturedPiece,
                ];
              }

              const playerInCheck = state.chess.inCheck();
              const playerInCheckmate = state.chess.isCheckmate();
              const playerInStalemate = state.chess.isStalemate();

              set({
                ...newState,
                board: aiBoard,
                currentPlayer: "white",
                isCheckmate: playerInCheckmate,
                isStalemate: playerInStalemate,
                modalState: playerInStalemate
                  ? {
                      isOpen: true,
                      title: "🤝 Pat!",
                      message:
                        "Oyun berabere bitti! Beyaz oyuncu yasal hamle yapamıyor.",
                      type: "stalemate",
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
        console.error("Invalid move:", error);
        return state;
      }
    }),

  initializeBoard: () => {
    const chess = new Chess();
    set({
      chess,
      board: convertBoardFromChess(chess),
      selectedPiece: null,
      currentPlayer: "white",
      moves: [],
      capturedPieces: { white: [], black: [] },
      isCheckmate: false,
      isStalemate: false,
      modalState: {
        isOpen: false,
        title: "",
        message: "",
        type: "check",
      },
    });
  },

  isValidMove: (from, to) => {
    const state = get();
    const fromSquare = convertToChessNotation(from) as Square;
    const toSquare = convertToChessNotation(to) as Square;

    try {
      const moves = state.chess.moves({
        square: fromSquare,
        verbose: true,
      });

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
}));
