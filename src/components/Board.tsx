import React from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { Square } from "./Square";
import { useGameStore } from "../store/gameStore";

// Taş ikonları için obje
const pieceIcons = {
  pawn: "chess-pawn",
  rook: "chess-rook",
  knight: "chess-knight",
  bishop: "chess-bishop",
  queen: "chess-queen",
  king: "chess-king",
};

export const Board: React.FC = () => {
  const {
    currentPlayer,
    playerColor,
    isMultiplayer,
    playerNickname,
    opponentNickname,
    lastMove,
    moveHistory,
  } = useGameStore();

  // Tahtayı çevirmek için gereken değişkenler
  const shouldRotateBoard = isMultiplayer && playerColor === "black";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Siyah oyuncu için sıraları ve dosyaları ters çevir
  const displayFiles = shouldRotateBoard ? [...files].reverse() : files;
  const displayRanks = shouldRotateBoard ? [...ranks].reverse() : ranks;

  // Nickname'leri doğru sıraya koy
  const leftNickname = isMultiplayer
    ? playerColor === "white"
      ? playerNickname || "Beyaz"
      : opponentNickname || "Beyaz"
    : "Sen";

  const rightNickname = isMultiplayer
    ? playerColor === "white"
      ? opponentNickname || "?"
      : playerNickname || "?"
    : "AI";

  const isLeftTurn =
    (playerColor === "white" && currentPlayer === "white") ||
    (playerColor === "black" && currentPlayer === "black") ||
    (!isMultiplayer && currentPlayer === "white");

  const isRightTurn = !isLeftTurn;

  return (
    <div className="relative flex flex-col items-center">
      {/* Player Names with VS icon - Only visible on desktop */}
      <div className="hidden md:flex flex-col items-center w-full mb-4">
        <div className="flex items-center justify-center gap-4 w-full">
          <motion.div
            initial={{ boxShadow: "none" }}
            animate={
              isLeftTurn
                ? {
                    boxShadow: [
                      "0 0 0px rgba(255, 215, 0, 0)",
                      "0 0 15px rgba(255, 215, 0, 0.7)",
                      "0 0 0px rgba(255, 215, 0, 0)",
                    ],
                  }
                : { boxShadow: "none" }
            }
            transition={
              isLeftTurn
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
            className="px-3 py-1 rounded-lg bg-[#3D2E22] border border-[#8B5E34] flex items-center gap-2"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-[#DEB887] font-[MedievalSharp]">
              {leftNickname}
            </span>
          </motion.div>

          <Swords className="w-6 h-6 text-[#DEB887]" />

          <motion.div
            initial={{ boxShadow: "none" }}
            animate={
              isRightTurn
                ? {
                    boxShadow: [
                      "0 0 0px rgba(255, 215, 0, 0)",
                      "0 0 15px rgba(255, 215, 0, 0.7)",
                      "0 0 0px rgba(255, 215, 0, 0)",
                    ],
                  }
                : { boxShadow: "none" }
            }
            transition={
              isRightTurn
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
            className="px-3 py-1 rounded-lg bg-[#3D2E22] border border-[#8B5E34] flex items-center gap-2"
          >
            <span className="text-[#DEB887] font-[MedievalSharp]">
              {rightNickname}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-black" />
          </motion.div>
        </div>

        {/* Last Move Indicator for desktop */}
        {lastMove && (
          <div className="flex items-center justify-center gap-1 mt-1 bg-[#3D2E22]/70 border border-[#8B5E34]/70 rounded-lg px-2 py-1 max-w-[200px]">
            <div
              className={`w-2 h-2 rounded-full ${
                lastMove.playerColor === "white" ? "bg-white" : "bg-black"
              }`}
            ></div>
            <span className="text-[#DEB887] font-[MedievalSharp] text-xs">
              {lastMove.piece && (
                <i
                  className={`fas fa-${pieceIcons[lastMove.piece.type]} text-${
                    lastMove.playerColor === "white" ? "white" : "gray-800"
                  } text-xs mx-1`}
                ></i>
              )}
              {lastMove.from} ➝ {lastMove.to}
            </span>
          </div>
        )}
      </div>

      {/* File letters (a-h) at the top */}
      <div className="flex ml-4">
        {displayFiles.map((file) => (
          <div
            key={file}
            className="w-[40px] md:w-[50px] lg:w-[60px] text-center text-sm md:text-base lg:text-lg text-white font-[MedievalSharp] uppercase"
          >
            {file}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Rank numbers (8-1) on the left */}
        <div className="flex flex-col justify-around mr-1 md:mr-2 text-sm md:text-base lg:text-lg text-white font-[MedievalSharp]">
          {displayRanks.map((rank) => (
            <div
              key={rank}
              className="h-[40px] md:h-[50px] lg:h-[60px] flex items-center"
            >
              {rank}
            </div>
          ))}
        </div>

        {/* Chess board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] grid grid-cols-8 bg-[#6B4423] p-1 md:p-2 rounded-lg shadow-2xl overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
            gridTemplateRows: "repeat(8, minmax(0, 1fr))",
            gap: "1px md:2px",
            transform: shouldRotateBoard ? "rotate(180deg)" : "none",
            maxWidth: "95vw",
          }}
        >
          {Array(8)
            .fill(null)
            .map((_, row) =>
              Array(8)
                .fill(null)
                .map((_, col) => {
                  // Siyah oyuncu için koordinatları ters çevir
                  const adjustedRow = shouldRotateBoard ? 7 - row : row;
                  const adjustedCol = shouldRotateBoard ? 7 - col : col;

                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        transform: shouldRotateBoard
                          ? "rotate(180deg)"
                          : "none",
                      }}
                    >
                      <Square
                        position={{ x: adjustedCol, y: adjustedRow }}
                        isLight={(row + col) % 2 === 0}
                      />
                    </div>
                  );
                })
            )}
        </motion.div>
      </div>
    </div>
  );
};
