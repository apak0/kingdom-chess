import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, LogOut } from "lucide-react";
import { Modal } from "./components/Modal";
import { Board } from "./components/Board";
import { CapturedPieces } from "./components/CapturedPieces";
import { useGameStore } from "./store/gameStore";
import { useAuthStore } from "./store/authStore";
import { SignIn } from "./components/auth/SignIn";
import { SignUp } from "./components/auth/SignUp";

function App() {
  const {
    currentPlayer,
    initializeBoard,
    capturedPieces,
    isCheckmate,
    modalState,
    closeModal,
  } = useGameStore();

  const { user, signOut, initAuth } = useAuthStore();
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const username = user?.user_metadata?.username;

  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/assets/royal-bg.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[MedievalSharp] text-[#FFD700] mb-2">
            KINGDOM of HARPOON
          </h1>
          <p className="text-[#DEB887] font-[MedievalSharp]">
            Sign in to start your journey
          </p>
        </div>

        {showSignUp ? <SignUp /> : <SignIn />}

        <button
          onClick={() => setShowSignUp(!showSignUp)}
          className="mt-4 text-[#DEB887] hover:text-[#FFD700] transition-colors font-[MedievalSharp]"
        >
          {showSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
      </div>
    );
  }

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
        <div className="flex justify-between items-center w-full mb-4">
          {/* Left - Reset Button */}
          <button
            onClick={initializeBoard}
            className="bg-[#B5838D] text-white p-2 mt-10  md:p-3 rounded-lg hover:bg-[#6D6875] transition-colors z-10"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Center - Title and Current Turn */}
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
              ) : (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4">
                  Current Turn: {currentPlayer === "white" ? "⚪ You" : "⚫ AI"}
                </p>
              )}
            </motion.div>
          </div>

          {/* Right - Username and Sign Out */}
          <div className="flex flex-col items-end gap-2">
            <span className="text-[#FFD700] font-[MedievalSharp] text-sm md:text-base px-3 py-1.5 bg-[#4A3728] rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              {username}
            </span>
            <button
              onClick={signOut}
              className="bg-[#8B0000] text-white p-2 md:p-3 rounded-lg hover:bg-[#A40000] transition-colors z-10 shadow-[0_0_15px_rgba(139,0,0,0.4)] hover:shadow-[0_0_20px_rgba(139,0,0,0.6)]"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
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
