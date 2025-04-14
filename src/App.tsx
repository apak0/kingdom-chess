import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, LogOut, CheckCircle, Eye } from "lucide-react";
import { Modal } from "./components/Modal";
import { Board } from "./components/Board";
import { CapturedPieces } from "./components/CapturedPieces";
import { useGameStore } from "./store/gameStore";
import { useAuthStore } from "./store/authStore";
import { useScoreStore } from "./store/scoreStore";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { ScoreBoard } from "./components/ScoreBoard";
import { Toaster, toast } from "sonner";

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

  const { user, signOut, initAuth } = useAuthStore();
  const { updateUserScore, toggleScoreboard } = useScoreStore();
  const [isProcessingScore, setIsProcessingScore] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Game end notifications
  useEffect(() => {
    if ((isCheckmate || isStalemate) && user && !isProcessingScore) {
      if (isStalemate) {
        toast.info(
          <div className="flex flex-col gap-3">
            <p>Oyun Pat ile Berabere Bitti!</p>
            <div className="flex justify-between gap-2">
              <button
                onClick={async () => {
                  setIsProcessingScore(true);
                  await updateUserScore(user.id, "stalemate");
                  toast.success("50 puan eklendi!", {
                    duration: 3000,
                    style: {
                      background: "#4A3728",
                      border: "2px solid #8B4513",
                      color: "#FFD700",
                      fontFamily: "MedievalSharp",
                    },
                  });
                  setIsProcessingScore(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B4513] text-[#FFD700] rounded hover:bg-[#6B4423] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Puanı Al (+50)
              </button>
              <button
                onClick={() => {
                  toggleScoreboard();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#4A3728] text-[#DEB887] rounded hover:bg-[#3A2718] transition-colors"
              >
                <Eye className="w-4 h-4" />
                Skor Tablosu
              </button>
            </div>
          </div>,
          {
            duration: Infinity,
            style: {
              background: "#4A3728",
              border: "2px solid #8B4513",
              color: "#FFD700",
              fontFamily: "MedievalSharp",
            },
          }
        );
      } else if (isCheckmate) {
        const gameResult = currentPlayer === "black" ? "win" : "loss";
        const pointChange = gameResult === "win" ? "+100" : "-5";
        const toastMessage =
          gameResult === "win"
            ? "Tebrikler, Kazandınız!"
            : "Maalesef, Kaybettiniz!";
        const pointText =
          gameResult === "win" ? "Puanı Al (+100)" : "Puanı Al (-5)";

        toast(
          <div className="flex flex-col gap-3">
            <p>{toastMessage}</p>
            <div className="flex justify-between gap-2">
              <button
                onClick={async () => {
                  setIsProcessingScore(true);
                  await updateUserScore(user.id, gameResult);
                  toast.success(`${pointChange} puan eklendi!`, {
                    duration: 3000,
                    style: {
                      background: "#4A3728",
                      border: "2px solid #8B4513",
                      color: "#FFD700",
                      fontFamily: "MedievalSharp",
                    },
                  });
                  setIsProcessingScore(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B4513] text-[#FFD700] rounded hover:bg-[#6B4423] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {pointText}
              </button>
              <button
                onClick={() => {
                  toggleScoreboard();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#4A3728] text-[#DEB887] rounded hover:bg-[#3A2718] transition-colors"
              >
                <Eye className="w-4 h-4" />
                Skor Tablosu
              </button>
            </div>
          </div>,
          {
            duration: Infinity,
            style: {
              background: "#4A3728",
              border: "2px solid #8B4513",
              color: "#FFD700",
              fontFamily: "MedievalSharp",
            },
          }
        );
      }
    }
  }, [
    isCheckmate,
    isStalemate,
    currentPlayer,
    user,
    updateUserScore,
    toggleScoreboard,
    isProcessingScore,
  ]);

  const username = user?.user_metadata?.username;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
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
              <Toaster position="top-center" />
              <ScoreBoard />

              <div className="relative w-full max-w-[1200px] px-2 md:px-0">
                <div className="flex justify-between items-center w-full mb-4">
                  <button
                    onClick={initializeBoard}
                    className="bg-[#B5838D] text-white p-2 mt-10  md:p-3 rounded-lg hover:bg-[#6D6875] transition-colors z-10"
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
                          Checkmate!{" "}
                          {currentPlayer === "white" ? "Black" : "White"} wins!
                        </p>
                      ) : isStalemate ? (
                        <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4 font-bold">
                          Stalemate! It's a draw!
                        </p>
                      ) : (
                        <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4">
                          Current Turn:{" "}
                          {currentPlayer === "white" ? "⚪ You" : "⚫ AI"}
                        </p>
                      )}
                    </motion.div>
                  </div>

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
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/signin"
        element={!user ? <SignInPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUpPage /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
