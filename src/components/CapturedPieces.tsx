import React from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
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
  const {
    currentPlayer,
    playerNickname,
    opponentNickname,
    playerColor,
    isMultiplayer,
  } = useGameStore();

  const showNames = color === (playerColor === "black" ? "white" : "black");

  // Nickname'leri doğru sıraya koy
  const leftNickname =
    color === "white"
      ? isMultiplayer
        ? playerNickname
        : "Sen"
      : isMultiplayer
      ? opponentNickname
      : "AI";
  const rightNickname =
    color === "white"
      ? isMultiplayer
        ? opponentNickname
        : "AI"
      : isMultiplayer
      ? playerNickname
      : "Sen";
  const isLeftTurn = color === currentPlayer;
  const isRightTurn = color !== currentPlayer;

  return (
    <div className="flex flex-col items-center gap-2">
      {showNames && (
        <div className="flex items-center justify-center gap-4 w-full mb-1">
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
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                color === "white" ? "bg-black" : "bg-black"
              }`}
            />
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
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                color === "white" ? "bg-white" : "bg-white"
              }`}
            />
          </motion.div>
        </div>
      )}

      {/* Captured pieces container */}
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
