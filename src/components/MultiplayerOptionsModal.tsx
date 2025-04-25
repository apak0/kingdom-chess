import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

interface MultiplayerOptionsModalProps {
  isOpen: boolean;
  onSelectOption: (option: "create" | "join", roomId?: string) => void;
}

export const MultiplayerOptionsModal: React.FC<
  MultiplayerOptionsModalProps
> = ({ isOpen, onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState<
    "create" | "join" | null
  >(null);
  const [roomId, setRoomId] = useState("");
  const [showRoomInput, setShowRoomInput] = useState(false);

  const handleSelect = (option: "create" | "join") => {
    if (option === "create") {
      setSelectedOption(option);
      setTimeout(() => {
        onSelectOption(option);
      }, 500);
    } else {
      setShowRoomInput(true);
      setSelectedOption(option);
    }
  };

  const handleJoinSubmit = () => {
    if (roomId.trim()) {
      onSelectOption("join", roomId.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{
            backgroundImage: `linear-gradient(rgba(74, 55, 40, 0.85), rgba(74, 55, 40, 0.85)), url("/assets/royal-bg.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative bg-[#4A3728]/80 backdrop-blur-sm text-center rounded-lg p-8 max-w-2xl w-full mx-4 shadow-xl border-2 border-[#8B5E34]"
            >
              <h2 className="text-3xl font-[MedievalSharp] text-[#DEB887] mb-8">
                Oyun Seçeneği
              </h2>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <motion.button
                  onClick={() => handleSelect("create")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    selectedOption === "create" ? { scale: 0, opacity: 0 } : {}
                  }
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="relative group"
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-br from-[#DEB887] to-[#8B5E34] rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: "blur(8px)" }}
                  />
                  <motion.div className="relative">
                    <img
                      src="/assets/create-room.png"
                      alt="Oda Oluştur"
                      className="w-[200px] md:w-[250px] rounded-lg"
                    />
                  </motion.div>
                </motion.button>

                <motion.button
                  onClick={() => handleSelect("join")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    selectedOption === "join" && !showRoomInput
                      ? { scale: 0, opacity: 0 }
                      : {}
                  }
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="relative group"
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-br from-[#DEB887] to-[#8B5E34] rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: "blur(8px)" }}
                  />
                  <motion.div className="relative">
                    <img
                      src="/assets/katil.png"
                      alt="Odaya Katıl"
                      className="w-[200px] md:w-[250px] rounded-lg"
                    />
                  </motion.div>
                </motion.button>
              </div>

              {/* Room Code Input */}
              <AnimatePresence>
                {showRoomInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 flex flex-col items-center gap-4"
                  >
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Oda Kodunu Girin"
                      maxLength={6}
                      className="w-full max-w-[200px] px-4 py-3 rounded-lg text-center text-2xl font-[MedievalSharp] bg-[#6B4423] text-[#DEB887] placeholder-[#DEB887]/50 border-2 border-[#8B5E34] focus:outline-none focus:ring-2 focus:ring-[#DEB887]"
                    />
                    <motion.button
                      onClick={handleJoinSubmit}
                      disabled={!roomId.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 text-lg font-[MedievalSharp] bg-[#8B5E34] text-[#DEB887] rounded-lg hover:bg-[#6B4423] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border border-[#DEB887]/30 hover:border-[#DEB887]/50"
                    >
                      Katıl
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
