import React from "react";
import { motion } from "framer-motion";
import { Piece as PieceComponent } from "./Piece";
import { Piece } from "../types";

interface CapturedPiecesProps {
  pieces: Piece[];
  color: "white" | "black";
  position?: "top" | "bottom" | "left" | "right";
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  pieces,
  color,
  position = "top",
}) => {
  // Adjust container classes based on position (desktop vs mobile)
  const isVertical = position === "top" || position === "bottom";

  // For desktop (left/right), make a vertical layout container
  // For mobile (top/bottom), keep the original horizontal layout
  const containerClasses = isVertical
    ? "flex flex-col items-center gap-2"
    : "flex flex-col items-center gap-2 h-full justify-center mt-20";

  // Adjust pieces container size based on position
  const piecesContainerClasses = isVertical
    ? "bg-[#6B4423] p-1.5 rounded-lg h-[65px] w-[320px] md:w-[600px] md:h-[45px] md:p-2 border-2 border-[#4A3728] max-w-[95vw]"
    : "bg-[#6B4423] p-1.5 rounded-lg h-[480px] w-[45px] border-2 border-[#4A3728] hidden md:flex flex-col";

  // Direction of pieces layout based on position
  const piecesLayoutClasses = isVertical
    ? "flex flex-wrap gap-0.5 md:gap-1 items-start content-start h-full"
    : "flex flex-col gap-0.5 flex-wrap items-center content-start w-full h-full";

  return (
    <div className={containerClasses}>
      {/* Captured pieces container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={piecesContainerClasses}
      >
        <div className={piecesLayoutClasses}>
          {pieces.map((piece, index) => (
            <motion.div
              key={`${piece.type}-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 flex items-center justify-center bg-[#5C3A21] rounded-md shadow-inner overflow-visible"
            >
              <div className="transform scale-125">
                <PieceComponent piece={piece} isCaptured={true} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
