import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimerBar } from "./TimerBar";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "check" | "checkmate" | "stalemate";
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
}) => {
  const getColorClass = () => {
    switch (type) {
      case "check":
        return "text-orange-300"; // Oyun temasına uygun turuncu
      case "checkmate":
        return "text-red-500"; // Mat durumu için kırmızı
      case "stalemate":
        return "text-[#DEB887]"; // Pat durumu için kahverengi
      default:
        return "text-[#DEB887]";
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
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-[#4A3728] text-center rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border-2 border-[#8B5E34]"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className={`text-2xl font-[MedievalSharp] mb-4 ${getColorClass()}`}
            >
              {title}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#DEB887] mb-4 font-[MedievalSharp]"
            >
              {message}
            </motion.p>
            <TimerBar duration={3000} onComplete={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
