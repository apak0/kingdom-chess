import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

// Ana uygulama içinde artık BrowserRouter yok, doğrudan Routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<GameScreen />} />
      <Route path="/join" element={<GameScreen />} />
    </Routes>
  );
}

// Oyun ekranı bileşeni
function GameScreen() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);

  // URL parametrelerini işleyen fonksiyon
  const handleDeepLink = () => {
    if (deepLinkProcessed) return false;

    const searchParams = new URLSearchParams(location.search);
    const roomParam = searchParams.get("room");

    if (roomParam) {
      console.log("Deep Link: Room code found in URL:", roomParam);

      // İlk olarak splash ve oyun modu ekranlarını kapat
      setShowSplash(false);
      setShowGameModeSelect(false);
      setShowMultiplayerOptions(false);

      // Odaya katılma işlemini başlat ve işlendiğini işaretle
      joinRoom(roomParam);
      setDeepLinkProcessed(true);

      // URL'den parametre kaldırılıyor
      navigate("/", { replace: true });

      return true;
    }
    return false;
  };

  useEffect(() => {
    // Deep link kontrolü - her URL değişikliğinde çalışır
    const hasJoinedRoom = handleDeepLink();

    // Eğer bir odaya katılmadıysak ve deep link işlemi yoksa normal açılış akışını sürdürüyoruz
    if (!hasJoinedRoom && !deepLinkProcessed) {
      // Eğer /join path'inde isek multiplayer ekranını göster
      if (location.pathname === "/join") {
        setShowSplash(false);
        setShowGameModeSelect(false);
        setShowMultiplayerOptions(true);
      }
    }
  }, [location, deepLinkProcessed]);

  // Bu effect yalnızca bileşen yüklendiğinde bir kez çalışır
  useEffect(() => {
    // Socket bağlantısını kontrol et ve aktif olduğundan emin ol
    console.log("App mounted, checking connection status");

    // Temizleme fonksiyonu
    return () => {
      console.log("App unmounted, cleaning up");
      setDeepLinkProcessed(false);
    };
  }, []);

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
        <div className="min-h-screen flex flex-col p-4 md:p-8 relative overflow-x-hidden">
          {/* Navigation Buttons and Title */}
          <div className="w-full px-4 flex justify-evenly items-center z-50 ">
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

            {/* Kingdom of Harpoon Title */}
            <div className="w-[150px] md:w-[200px]">
              <img
                src="/assets/title-sign-table.png"
                alt="Kingdom of Harpoon"
                className=""
              />
            </div>

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
              playerColor={playerColor || "white"}
            />
          )}

          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-[1200px] flex flex-col items-center px-2 md:px-0 z-10">
              <div className="w-full flex justify-center items-center mb-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
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

              <div className="flex flex-col items-center gap-1 md:gap-2 mt-4 md:mt-8">
                {isMultiplayer && playerColor === "black" ? (
                  <>
                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                    />
                  </>
                ) : (
                  <>
                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <Modal
            isOpen={modalState.isOpen}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            onClose={closeModal}
          />
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
