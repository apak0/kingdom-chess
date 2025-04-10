import React from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Modal } from "./components/Modal";
import { Board } from "./components/Board";
import { CapturedPieces } from "./components/CapturedPieces";
import { useGameStore } from "./store/gameStore";

function App() {
  const {
    currentPlayer,
    initializeBoard,
    capturedPieces,
    isCheckmate,
    modalState,
    closeModal,
  } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFB4A2] to-[#E5989B] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-[MedievalSharp] text-[#6D6875] mb-2">
          KINGDOM of HARPOON
        </h1>
        {isCheckmate ? (
          <p className="text-lg font-[MedievalSharp] text-[#B5838D] mb-4 font-bold">
            Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!
          </p>
        ) : (
          <p className="text-lg font-[MedievalSharp] text-[#B5838D] mb-4">
            Current Turn: {currentPlayer === "white" ? "⚪ You" : "⚫ AI"}
          </p>
        )}

        <button
          onClick={initializeBoard}
          className="bg-[#B5838D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6D6875] transition-colors mx-auto font-[MedievalSharp]"
        >
          <RotateCcw size={20} />
          New Game
        </button>
      </motion.div>

      <div className="flex gap-8 items-center">
        <CapturedPieces pieces={capturedPieces.black} color="black" />
        <Board />
        <CapturedPieces pieces={capturedPieces.white} color="white" />
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
