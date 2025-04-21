import React from "react";
import { motion } from "framer-motion";
import { Square } from "./Square";
import { useGameStore } from "../store/gameStore";

export const Board: React.FC = () => {
  const { currentPlayer, playerColor, isMultiplayer } = useGameStore();

  // Tahtayı çevirmek için gereken değişkenler
  const shouldRotateBoard = isMultiplayer && playerColor === "black";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Siyah oyuncu için sıraları ve dosyaları ters çevir
  const displayFiles = shouldRotateBoard ? [...files].reverse() : files;
  const displayRanks = shouldRotateBoard ? [...ranks].reverse() : ranks;

  return (
    <div className="relative flex flex-col">
      {/* File letters (a-h) at the top */}
      <div className="flex ml-4">
        {displayFiles.map((file) => (
          <div
            key={file}
            className="w-[40px] md:w-[92px] text-center text-sm md:text-lg text-white font-[MedievalSharp] uppercase"
          >
            {file}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Rank numbers (8-1) on the left */}
        <div className="flex flex-col justify-around mr-1 md:mr-2 text-sm md:text-lg text-white font-[MedievalSharp]">
          {displayRanks.map((rank) => (
            <div key={rank} className="h-[40px] md:h-[92px] flex items-center">
              {rank}
            </div>
          ))}
        </div>

        {/* Chess board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[320px] h-[320px] md:w-[740px] md:h-[740px] grid grid-cols-8 bg-[#6B4423] p-1 md:p-2 rounded-lg shadow-2xl overflow-hidden"
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
