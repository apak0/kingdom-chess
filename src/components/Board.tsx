import React from "react";
import { motion } from "framer-motion";
import { Square } from "./Square";
import { useGameStore } from "../store/gameStore";

export const Board: React.FC = () => {
  const { currentPlayer } = useGameStore();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="relative flex flex-col">
      {/* File letters (a-h) at the top */}
      <div className="flex ml-8 mb-1">
        {files.map((file) => (
          <div
            key={file}
            className="w-[92px] text-center text-lg text-[#563fea] font-[MedievalSharp] uppercase"
          >
            {file}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Rank numbers (8-1) on the left */}
        <div className="flex flex-col justify-around mr-2 text-lg text-[#563fea] font-[MedievalSharp]">
          {ranks.map((rank) => (
            <div key={rank} className="h-[92px] flex items-center">
              {rank}
            </div>
          ))}
        </div>

        {/* Chess board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[740px] h-[740px] grid grid-cols-8 bg-[#6B4423] p-2 rounded-lg shadow-2xl overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(8, minmax(80px, 1fr))",
            gridTemplateRows: "repeat(8, minmax(80px, 1fr))",
            gap: "2px",
          }}
        >
          {Array(8)
            .fill(null)
            .map((_, row) =>
              Array(8)
                .fill(null)
                .map((_, col) => (
                  <Square
                    key={`${row}-${col}`}
                    position={{ x: col, y: row }}
                    isLight={(row + col) % 2 === 0}
                  />
                ))
            )}
        </motion.div>
      </div>
    </div>
  );
};
