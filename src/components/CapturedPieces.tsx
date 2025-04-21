import React from "react";
import { motion } from "framer-motion";
import { Piece as PieceComponent } from "./Piece";
import { Piece } from "../types";
import { useGameStore } from "../store/gameStore";

interface CapturedPiecesProps {
  pieces: Piece[];
  color: "white" | "black";
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  pieces,
  color,
}) => {
  const { currentPlayer, isMultiplayer, playerColor } = useGameStore();
  const isActive = color === currentPlayer;

  return (
    <motion.div
      initial={{ opacity: 0, x: color === "white" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        bg-[#6B4423] p-6 rounded-lg min-h-[100px] w-[250px]
        border-4 transition-all duration-300 relative
        ${
          isActive
            ? "border-[#FFD700] shadow-[0_0_35px_rgba(255,215,0,0.4)]"
            : "border-[#4A3728] shadow-lg"
        }
        before:content-[''] before:absolute before:inset-0
        before:border-2 before:border-[#8B4513] before:rounded-lg before:m-2
      `}
    >
      <h3 className="text-xl mb-4 font-[MedievalSharp] text-center tracking-wide">
        <div
          className={color === "white" ? "text-[#FFD700]" : "text-[#FFD700]"}
        >
          ⚜️ {color === "white" ? "White" : "Black"} ⚜️
        </div>
        <div className="text-[#DEB887] text-sm mt-1">Captured Pieces</div>
      </h3>
      <div className="grid grid-cols-3 p-2 gap-2 min-h-16 bg-[#5C3A21] rounded-lg border border-[#8B4513]">
        {pieces.map((piece, index) => (
          <motion.div
            key={`${piece.type}-${index}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.1,
            }}
            className="w-12 h-12 flex items-center justify-center bg-[#6B4423] rounded-md shadow-inner"
          >
            <PieceComponent piece={piece} isCaptured={true} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
