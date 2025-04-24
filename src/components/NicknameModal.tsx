import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NicknameModalProps {
  isOpen: boolean;
  onSubmit: (nickname: string) => void;
  isHost?: boolean;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  onSubmit,
  isHost = false,
}) => {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-[#4A3728] text-center rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border-2 border-[#8B5E34]"
          >
            <h2 className="text-2xl font-[MedievalSharp] text-[#DEB887] mb-4">
              {isHost ? "Oyunu Başlat" : "Oyuna Katıl"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Takma Adınız"
                  maxLength={20}
                  className="w-full px-4 py-2 rounded bg-[#6B4423] text-[#DEB887] placeholder-[#DEB887]/50 border border-[#8B5E34] focus:outline-none focus:ring-2 focus:ring-[#DEB887]"
                />
              </div>
              <button
                type="submit"
                disabled={!nickname.trim()}
                className="w-full px-6 py-2 text-lg font-[MedievalSharp] bg-[#8B5E34] text-[#DEB887] rounded hover:bg-[#6B4423] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isHost ? "Oyunu Başlat" : "Katıl"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
