import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Copy } from "lucide-react";
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
    createRoom,
    joinRoom,
    roomId,
    isMultiplayer,
    playerColor,
  } = useGameStore();

  const [joinRoomId, setJoinRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  Şah Mat! {currentPlayer === "white" ? "Siyah" : "Beyaz"}{" "}
                  kazandı!
                </p>
              ) : isStalemate ? (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4 font-bold">
                  Pat! Berabere!
                </p>
              ) : (
                <p className="text-base md:text-lg font-[MedievalSharp] text-white mb-4">
                  Sıra: {currentPlayer === "white" ? "⚪ Beyaz" : "⚫ Siyah"}
                </p>
              )}
            </motion.div>
          </div>

          <div className="w-[48px] h-[48px]" />
        </div>

        {!isMultiplayer && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
            <button
              onClick={createRoom}
              className="bg-[#B5838D] text-white px-4 py-2 rounded-lg hover:bg-[#6D6875] transition-colors"
            >
              Oda Oluştur
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Oda Kodu"
                className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20"
                maxLength={6}
              />
              <button
                onClick={() => joinRoom(joinRoomId)}
                className="bg-[#B5838D] text-white px-4 py-2 rounded-lg hover:bg-[#6D6875] transition-colors"
              >
                Odaya Katıl
              </button>
            </div>
          </div>
        )}

        {roomId && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="text-white bg-white/10 px-4 py-2 rounded-lg">
              Oda Kodu: {roomId}
            </div>
            <button
              onClick={copyRoomId}
              className="bg-[#B5838D] text-white p-2 rounded-lg hover:bg-[#6D6875] transition-colors"
              title="Kodu Kopyala"
            >
              <Copy className="w-5 h-5" />
            </button>
            {copied && (
              <span className="text-white text-sm">Kod kopyalandı!</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2 mt-4 md:mt-8 px-2 md:px-0">
        {isMultiplayer && playerColor === "black" ? (
          <>
            <CapturedPieces pieces={capturedPieces.white} color="white" />
            <Board />
            <CapturedPieces pieces={capturedPieces.black} color="black" />
          </>
        ) : (
          <>
            <CapturedPieces pieces={capturedPieces.black} color="black" />
            <Board />
            <CapturedPieces pieces={capturedPieces.white} color="white" />
          </>
        )}
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
