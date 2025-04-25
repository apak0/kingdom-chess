import { motion } from "framer-motion";
import React, { useState } from "react";

interface GameModeModalProps {
  isOpen: boolean;
  onSelectMode: (mode: "ai" | "multiplayer") => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({
  isOpen,
  onSelectMode,
}) => {
  const [selectedMode, setSelectedMode] = useState<"ai" | "multiplayer" | null>(
    null
  );

  const handleModeSelect = (mode: "ai" | "multiplayer") => {
    setSelectedMode(mode);
    setTimeout(() => {
      onSelectMode(mode);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
      <motion.button
        onClick={() => handleModeSelect("ai")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={selectedMode === "ai" ? { scale: 0, opacity: 0 } : {}}
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
          src="/assets/play-with-ai.png"
          alt="AI ile Oyna"
          className="w-[200px] md:w-[250px] h-[133px] md:h-[166px] rounded-lg object-cover"
        />
        </motion.div>
      </motion.button>

      <motion.button
        onClick={() => handleModeSelect("multiplayer")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
        selectedMode === "multiplayer" ? { scale: 0, opacity: 0 } : {}
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
          src="/assets/play-with-friend.png"
          alt="Arkadaşınla Oyna"
          className="w-[200px] md:w-[250px] h-[150px] md:h-[166px] rounded-lg object-cover"
        />
        </motion.div>
      </motion.button>
      </div>
    </motion.div>
  );
};
