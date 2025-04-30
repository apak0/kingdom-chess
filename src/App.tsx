import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Swords, RotateCcw } from "lucide-react";
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
import { ToastContainer } from "./components/Toast";

// Taş ikonları için obje
const pieceIcons = {
  pawn: "chess-pawn",
  rook: "chess-rook",
  knight: "chess-knight",
  bishop: "chess-bishop",
  queen: "chess-queen",
  king: "chess-king",
};

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
    toastMessages,
    clearToastMessage,
    lastMove,
    moveHistory,
    undoMove,
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
      {/* Toast Notifications */}
      <ToastContainer messages={toastMessages} onClose={clearToastMessage} />

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
          className="flex flex-col p-4  relative overflow-x-hidden"
          style={{
            minHeight: "calc(100vh - 100px)",
          }}
        >
          {/* Navigation Buttons and Title */}
          <div className="w-full px-4 flex justify-evenly items-center z-50 md:hidden">
            {/* Home Button */}
            <motion.button
              onClick={handleHomeClick}
              title="Ana Menü"
              className="relative transition-transform duration-300 ease-in-out hover:scale-110"
            >
              <img
                src="/assets/home-button.png"
                alt="Ana Menü"
                className="w-[100px] md:w-[90px] rounded-lg"
              />
            </motion.button>

            {/* Kingdom of Harpoon Title - Desktop'ta gizlendi */}
            <div className="w-[150px] md:hidden">
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
                className="w-[100px] md:w-[90px] rounded-lg"
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
              {/* Player Names with VS icon - Mobile view */}
              <div className="md:hidden flex flex-col items-center w-full mb-4">
                <div className="flex items-center justify-center gap-4 w-full">
                  <motion.div
                    initial={{ boxShadow: "none" }}
                    animate={
                      (isMultiplayer && playerColor === currentPlayer) ||
                      (!isMultiplayer && currentPlayer === "white")
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
                      (isMultiplayer && playerColor === currentPlayer) ||
                      (!isMultiplayer && currentPlayer === "white")
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : { duration: 0.3 }
                    }
                    className="px-3 py-1 rounded-lg bg-[#3D2E22] border border-[#8B5E34] flex items-center gap-2"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span className="text-[#DEB887] font-[MedievalSharp]">
                      {isMultiplayer ? nickname || "Sen" : "Sen"}
                    </span>
                  </motion.div>

                  <Swords className="w-6 h-6 text-[#DEB887]" />

                  <motion.div
                    initial={{ boxShadow: "none" }}
                    animate={
                      (isMultiplayer && playerColor !== currentPlayer) ||
                      (!isMultiplayer && currentPlayer === "black")
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
                      (isMultiplayer && playerColor !== currentPlayer) ||
                      (!isMultiplayer && currentPlayer === "black")
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
                      {isMultiplayer ? opponentNickname || "?" : "AI"}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </motion.div>
                </div>
              </div>

              {/* Last Move Indicator for mobile */}
              <div className="md:hidden flex justify-center w-full mb-1">
                <div className="flex items-center justify-center gap-2">
                  {lastMove && (
                    <div className="flex items-center justify-center gap-1 bg-[#3D2E22]/70 border border-[#8B5E34]/70 rounded-lg px-2 py-1 max-w-[200px]">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          lastMove.playerColor === "white"
                            ? "bg-white"
                            : "bg-black"
                        }`}
                      ></div>
                      <span className="text-[#DEB887] font-[MedievalSharp] text-xs">
                        {lastMove.piece && (
                          <i
                            className={`fas fa-${
                              pieceIcons[lastMove.piece.type]
                            } text-${
                              lastMove.playerColor === "white"
                                ? "white"
                                : "gray-800"
                            } text-xs mx-1`}
                          ></i>
                        )}
                        {lastMove.from} ➝ {lastMove.to}
                      </span>
                    </div>
                  )}

                  {/* Geri Al butonu - Mobil için Move Indicator'ın yanında */}
                  {moveHistory.length > 0 && !isMultiplayer && (
                    <motion.button
                      onClick={undoMove}
                      className="flex items-center gap-1 bg-[#3D2E22] hover:bg-[#2a1f17] border border-[#8B5E34] text-[#DEB887] rounded-lg px-2 py-1 text-xs font-[MedievalSharp] transition-colors"
                    >
                      <RotateCcw size={14} />
                      Geri Al
                    </motion.button>
                  )}
                </div>
              </div>

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

              {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
              {isMultiplayer && playerColor === "black" ? (
                <>
                  {/* Mobile Layout - Vertical */}
                  <div className="flex flex-col items-center gap-1 md:gap-2 mt-4 md:mt-8 md:hidden">
                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                      position="top"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                      position="bottom"
                    />
                  </div>

                  {/* Desktop Layout - Horizontal with Side Navigation */}
                  <div className="hidden md:flex items-center justify-center gap-8 mt-8">
                    {/* Left navigation (Home button) */}
                    <div className="flex flex-col items-center justify-center">
                      <motion.button
                        onClick={handleHomeClick}
                        title="Ana Menü"
                        className="transition-transform duration-300 ease-in-out hover:scale-110 mb-6"
                      >
                        <img
                          src="/assets/home-button.png"
                          alt="Ana Menü"
                          className="w-[100px] xl:w-[120px] rounded-lg"
                        />
                      </motion.button>
                    </div>

                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                      position="left"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                      position="right"
                    />

                    {/* Right navigation (Restart button) */}
                    <div className="flex flex-col items-center justify-center">
                      <motion.button
                        onClick={initializeBoard}
                        title="Oyunu Sıfırla"
                        className="transition-transform duration-300 ease-in-out hover:scale-110 mb-6"
                      >
                        <img
                          src="/assets/restart-button.png"
                          alt="Oyunu Sıfırla"
                          className="w-[100px] xl:w-[120px] rounded-lg"
                        />
                      </motion.button>

                      {/* Geri Alma Butonu - Restart'ın altında */}
                      {moveHistory.length > 0 && !isMultiplayer && (
                        <motion.button
                          onClick={undoMove}
                          className="flex items-center gap-1 bg-[#3D2E22] hover:bg-[#2a1f17] border border-[#8B5E34] text-[#DEB887] rounded-lg px-3 py-1 text-sm font-[MedievalSharp] transition-colors"
                        >
                          <RotateCcw size={16} />
                          Geri Al
                        </motion.button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Layout - Vertical */}
                  <div className="flex flex-col items-center gap-1 md:gap-2 mt-4 md:mt-8 md:hidden">
                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                      position="top"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                      position="bottom"
                    />
                  </div>

                  {/* Desktop Layout - Horizontal with Side Navigation */}
                  <div className="hidden md:flex items-start justify-center gap-8 ">
                    {/* Left navigation (Home button) */}
                    <div className="flex flex-col items-center justify-center">
                      <motion.button
                        onClick={handleHomeClick}
                        title="Ana Menü"
                        className="transition-transform duration-300 ease-in-out hover:scale-110 mb-6"
                      >
                        <img
                          src="/assets/home-button.png"
                          alt="Ana Menü"
                          className="w-[100px] xl:w-[120px] rounded-lg"
                        />
                      </motion.button>
                    </div>

                    <CapturedPieces
                      pieces={capturedPieces.black}
                      color="black"
                      position="left"
                    />
                    <Board />
                    <CapturedPieces
                      pieces={capturedPieces.white}
                      color="white"
                      position="right"
                    />

                    {/* Right navigation (Restart button) */}
                    <div className="flex flex-col items-center justify-center">
                      <motion.button
                        onClick={initializeBoard}
                        title="Oyunu Sıfırla"
                        className="transition-transform duration-300 ease-in-out hover:scale-110 mb-6"
                      >
                        <img
                          src="/assets/restart-button.png"
                          alt="Oyunu Sıfırla"
                          className="w-[100px] xl:w-[120px] rounded-lg"
                        />
                      </motion.button>

                      {/* Geri Alma Butonu - Restart'ın altında */}
                      {moveHistory.length > 0 && !isMultiplayer && (
                        <motion.button
                          onClick={undoMove}
                          className="flex items-center gap-1 bg-[#3D2E22] hover:bg-[#2a1f17] border border-[#8B5E34] text-[#DEB887] rounded-lg px-3 py-1 text-sm font-[MedievalSharp] transition-colors"
                        >
                          <RotateCcw size={16} />
                          Geri Al
                        </motion.button>
                      )}
                    </div>
                  </div>
                </>
              )}
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
