import React from "react";
import { motion } from "framer-motion";
import { Piece as PieceComponent } from "./Piece";
import { Piece } from "../types";

interface CapturedPiecesProps {
  pieces: Piece[];
  color: "white" | "black";
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  pieces,
  color,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#6B4423] p-1.5 rounded-lg h-[80px] w-[320px] md:w-[600px] md:h-[45px] md:p-2 border-2 border-[#4A3728] max-w-[95vw]"
    >
      <div className="flex flex-wrap gap-0.5 md:gap-1 items-start content-start h-full">
        {pieces.map((piece, index) => (
          <motion.div
            key={`${piece.type}-${index}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="w-[31px] h-[31px] md:w-7 ml-1 md:h-7 flex-shrink-0 flex items-center justify-center bg-[#5C3A21] rounded-md shadow-inner"
          >
            <PieceComponent piece={piece} isCaptured={true} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
