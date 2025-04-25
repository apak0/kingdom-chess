import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { Modal } from "./components/Modal";
import { Board } from "./components/Board";
import { CapturedPieces } from "./components/CapturedPieces";
import { NicknameModal } from "./components/NicknameModal";
import { ChatBox } from "./components/ChatBox";
import { SplashScreen } from "./components/SplashScreen";
import { GameModeModal } from "./components/GameModeModal";
import { MultiplayerOptionsModal } from "./components/MultiplayerOptionsModal";
import { RoomCodeModal } from "./components/RoomCodeModal";
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
    showNicknameModal,
    setNickname,
    nickname,
    opponentNickname,
    messages,
    sendChatMessage,
  } = useGameStore();

  const [showSplash, setShowSplash] = useState(true);
  const [showGameModeSelect, setShowGameModeSelect] = useState(false);
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [showRoomCodeModal, setShowRoomCodeModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");

    if (roomParam && !isMultiplayer) {
      joinRoom(roomParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [joinRoom, isMultiplayer]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowGameModeSelect(true);
  };

  const handleModeSelect = (mode: "ai" | "multiplayer") => {
    if (mode === "ai") {
      initializeBoard();
      setShowGameModeSelect(false);
    } else {
      setShowGameModeSelect(false);
      setShowMultiplayerOptions(true);
    }
  };

  const handleMultiplayerOptionSelect = (
    option: "create" | "join",
    roomId?: string
  ) => {
    setShowMultiplayerOptions(false);
    if (option === "create") {
      createRoom();
    } else if (roomId) {
      joinRoom(roomId);
    }
  };

  const handleNicknameSubmit = (nickname: string) => {
    setNickname(nickname);
    if (isMultiplayer && playerColor === "white") {
      setShowRoomCodeModal(true);
    }
  };

  const handleHomeClick = () => {
    setShowGameModeSelect(true);
  };

  return (
    <div className="relative">
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 55, 40, 0.85), rgba(74, 55, 40, 0.85)), url("/assets/royal-bg.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onAnimationComplete={handleSplashComplete} />
        )}
        {showGameModeSelect && (
          <GameModeModal isOpen={true} onSelectMode={handleModeSelect} />
        )}
      </AnimatePresence>

      {!showSplash && !showGameModeSelect && !showMultiplayerOptions && (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden"
          style={{
            paddingBottom: "200px",
          }}
        >
          {/* Navigation Buttons */}
          <div className="fixed top-4 left-0 right-0 px-4 flex justify-between z-50">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              title="Ana Menü"
              className="relative items-center justify-start inline-block px-5 py-2.5 overflow-hidden font-medium transition-all bg-green-500 rounded-lg hover:bg-green-50 group"
            >
              <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-green-50 rounded-lg"></span>
              <span className="relative w-full text-base font-semibold text-left text-white transition-colors duration-200 ease-in-out group-hover:text-green-600">
                <Home className="w-5 h-5 md:w-6 md:h-6" />
              </span>
            </button>

            {/* Reset Button */}
            <button
              onClick={initializeBoard}
              title="Reset Game"
              className="relative items-center justify-start inline-block px-5 py-2.5 overflow-hidden font-medium transition-all bg-indigo-400 rounded-lg hover:bg-indigo-50 group"
            >
              <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-indigo-50 rounded-lg"></span>
              <span className="relative w-full text-base font-semibold text-left text-white transition-colors duration-200 ease-in-out group-hover:text-indigo-600">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
              </span>
            </button>
          </div>

          {/* Modals */}
          <NicknameModal
            isOpen={showNicknameModal}
            onSubmit={handleNicknameSubmit}
            isHost={playerColor === "white"}
          />
          <RoomCodeModal
            isOpen={showRoomCodeModal}
            roomId={roomId || ""}
            onClose={() => setShowRoomCodeModal(false)}
          />

          {/* Chat Box - Only show in multiplayer mode */}
          {isMultiplayer && (
            <ChatBox
              messages={messages}
              onSendMessage={sendChatMessage}
              playerNickname={nickname || "..."}
              opponentNickname={opponentNickname || "..."}
              playerColor={playerColor || "white"}
            />
          )}

          <div className="relative w-full max-w-[1200px] px-2 md:px-0 z-10">
            <div className="flex justify-center items-center w-full mb-4">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-[150px] md:w-[200px]">
                    <img
                      src="/assets/title-sign-table.png"
                      alt="Kingdom of Harpoon"
                      className=""
                    />
                  </div>

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
                    <p className=""></p>
                  )}
                </motion.div>
              </div>
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
        </div>
      )}

      {showMultiplayerOptions && (
        <MultiplayerOptionsModal
          isOpen={true}
          onSelectOption={handleMultiplayerOptionSelect}
        />
      )}
    </div>
  );
}

export default App;
