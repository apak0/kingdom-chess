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
    }, 1500); // Animasyon için süreyi uzattım
  };

  // Masaüstü ve mobil için aynı seçim animasyonu
  const selectAnimationVariants = {
    initial: {
      scale: 1,
      opacity: 1,
    },
    selected: {
      scale: 0, // Tam olarak 0'a küçülsün - mobil ekranlardaki gibi
      opacity: 0,
      transition: {
        scale: {
          duration: 0.5, // Mobil ile aynı sürede küçülsün
          ease: "easeIn", // Daha doğal bir küçülme hissi için
        },
        opacity: {
          duration: 0.3,
          delay: 0.2, // Önce küçülmeye başlasın, sonra saydamlık azalsın
          ease: "easeOut",
        },
      },
    },
  };

  // Resim için özel animasyon varyantları
  const imageAnimationVariants = {
    initial: {
      scale: 1,
      opacity: 1,
    },
    selected: {
      scale: 0, // Tam olarak 0'a küçülsün
      opacity: 0,
      transition: {
        scale: {
          duration: 0.7, // Biraz daha uzun sürede küçülsün
          ease: "easeIn",
        },
        opacity: {
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut",
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center mx-4 md:mx-0">
        <motion.button
          onClick={() => handleModeSelect("ai")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            selectedMode === "ai"
              ? selectAnimationVariants.selected
              : selectAnimationVariants.initial
          }
          className="relative group"
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-br from-[#DEB887] to-[#8B5E34] rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: "blur(8px)" }}
            animate={
              selectedMode === "ai"
                ? { scale: 0, opacity: 0 }
                : { scale: 1, opacity: 0.5 }
            }
            transition={{
              duration: 0.4,
            }}
          />
          <motion.div className="relative">
            <motion.img
              src="/assets/play-with-ai.png"
              alt="AI ile Oyna"
              className="w-[260px] md:w-[500px] h-[173px] md:h-[332px] rounded-lg object-cover"
              animate={
                selectedMode === "ai"
                  ? imageAnimationVariants.selected
                  : imageAnimationVariants.initial
              }
            />
          </motion.div>
        </motion.button>

        <motion.button
          onClick={() => handleModeSelect("multiplayer")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            selectedMode === "multiplayer"
              ? selectAnimationVariants.selected
              : selectAnimationVariants.initial
          }
          className="relative group"
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-br from-[#DEB887] to-[#8B5E34] rounded-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            style={{ filter: "blur(8px)" }}
            animate={
              selectedMode === "multiplayer"
                ? { scale: 0, opacity: 0 }
                : { scale: 1, opacity: 0.5 }
            }
            transition={{
              duration: 0.4,
            }}
          />
          <motion.div className="relative">
            <motion.img
              src="/assets/play-with-friend.png"
              alt="Arkadaşınla Oyna"
              className="w-[260px] md:w-[500px] h-[195px] md:h-[332px] rounded-lg object-cover"
              animate={
                selectedMode === "multiplayer"
                  ? imageAnimationVariants.selected
                  : imageAnimationVariants.initial
              }
            />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
};
