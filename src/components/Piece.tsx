import React from "react";
import { Piece as PieceType } from "../types";
import { useGameStore } from "../store/gameStore";

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isCaptured?: boolean;
}

const pieceIcons = {
  pawn: "chess-pawn",
  rook: "chess-rook",
  knight: "chess-knight",
  bishop: "chess-bishop",
  queen: "chess-queen",
  king: "chess-king",
};

export const Piece: React.FC<PieceProps> = ({
  piece,
  isSelected,
  isCaptured = false,
}) => {
  const { currentPlayer, isCheckmate, isMultiplayer, playerColor } =
    useGameStore();
  const isCurrentPlayer = piece.color === currentPlayer;
  const shouldRotate = isMultiplayer && playerColor === "black";

  const isCheckmatedKing =
    isCheckmate && piece.type === "king" && piece.color === currentPlayer;
  const isWinningKing =
    isCheckmate && piece.type === "king" && piece.color !== currentPlayer;

  // Geçerli bir taş tipinin olduğunu kontrol et
  const pieceIcon =
    piece.type && pieceIcons[piece.type] ? pieceIcons[piece.type] : "question";

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center relative transform transition-transform duration-200
        ${
          isCheckmatedKing
            ? "text-red-600"
            : piece.color === "white"
            ? "text-white"
            : "text-gray-800"
        }
        ${isSelected ? "z-10 scale-110" : ""}
        ${
          isCurrentPlayer && !isCheckmate && !isCaptured
            ? "cursor-pointer hover:scale-105"
            : "cursor-default"
        }
      `}
      style={{ transform: shouldRotate ? "rotate(180deg)" : "none" }}
    >
      <i
        className={`fas fa-${pieceIcon} ${
          isCaptured ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
        } ${isSelected ? "filter drop-shadow-lg" : ""}`}
      />
      {isSelected && (
        <div className="absolute -inset-3 bg-gradient-to-br from-amber-200/40 to-yellow-400/40 rounded-full -z-10 shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
      )}
      {isCheckmatedKing && (
        <div className="absolute -inset-3 bg-gradient-to-br from-red-400/40 to-red-600/40 rounded-full -z-10 shadow-[0_0_15px_rgba(220,38,38,0.3)]" />
      )}
      {isWinningKing && (
        <div className="absolute -inset-3 bg-gradient-to-br from-green-400/40 to-green-600/40 rounded-full -z-10 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
      )}
    </div>
  );
};
