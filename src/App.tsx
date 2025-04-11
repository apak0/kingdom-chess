import React from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Modal } from "./components/Modal";
import { Board } from "./components/Board";
import { CapturedPieces } from "./components/CapturedPieces";
import { useGameStore } from "./store/gameStore";

// Import the background image
import royalBg from "./assets/royal-bg.jpg";

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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/assets/royal-bg.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative w-full max-w-[1200px] px-2 md:px-0">
        <button
          onClick={initializeBoard}
          className="absolute  right-1  md:right-0 md:top-0 bg-[#B5838D] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2 hover:bg-[#6D6875] transition-colors font-[MedievalSharp] z-10 text-sm md:text-base"
        >
          <RotateCcw size={16} className="md:w-5 md:h-5" />
          
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-8 text-center"
        >
          <h1 className="text-2xl md:text-4xl font-[MedievalSharp] text-white mb-2">
            KINGDOM of HARPOON
          </h1>
          {isCheckmate ? (
            <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4 font-bold">
              Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!
            </p>
          ) : (
            <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4">
              Current Turn: {currentPlayer === "white" ? "⚪ You" : "⚫ AI"}
            </p>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
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
