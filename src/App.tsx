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
    isStalemate,
    modalState,
    closeModal,
  } = useGameStore();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://i.hizliresim.com/t7u9qaj.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative w-full max-w-[1200px] px-2 md:px-0 z-10">
        <div className="flex justify-between items-center w-full mb-4">
          <button
            onClick={initializeBoard}
            className="bg-[#B5838D] text-white p-2 mt-10 md:p-3 rounded-lg hover:bg-[#6D6875] transition-colors z-10"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-4xl font-[MedievalSharp] text-white mb-2">
                KINGDOM of HARPOON
              </h1>
              {isCheckmate ? (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4 font-bold">
                  Checkmate! {currentPlayer === "white" ? "Black" : "White"}{" "}
                  wins!
                </p>
              ) : isStalemate ? (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4 font-bold">
                  Stalemate! It's a draw!
                </p>
              ) : (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4">
                  Current Turn: {currentPlayer === "white" ? "⚪ You" : "⚫ AI"}
                </p>
              )}
            </motion.div>
          </div>
          <div className="w-[48px] h-[48px]" />{" "}
          {/* Spacer for layout balance */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center mt-8">
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
