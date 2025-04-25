import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
            <motion.button
              onClick={handleHomeClick}
              title="Ana Menü"
              className="relative transition-transform duration-300 ease-in-out hover:scale-110"
            >
              <img
                src="/assets/home-button.png"
                alt="Ana Menü"
                className="w-[100px] md:w-[180px] rounded-lg"
              />
            </motion.button>

            {/* Reset Button */}
            <motion.button
              onClick={initializeBoard}
              title="Oyunu Sıfırla"
              className="relative transition-transform duration-300 ease-in-out hover:scale-110"
            >
              <img
                src="/assets/restart-button.png"
                alt="Oyunu Sıfırla"
                className="w-[100px] md:w-[180px] rounded-lg"
              />
            </motion.button>
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
