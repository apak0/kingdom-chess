import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ToastProps {
  message: ToastMessage;
  index?: number;
  onClose?: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  index = 0,
  onClose,
  duration = 3000,
}) => {
  const [visible, setVisible] = useState(true);

  // İlk kelimeyi ve elipsleri ayıkla
  const getFirstWordWithEllipsis = (text: string) => {
    if (!text) return "";
    const words = text.trim().split(" ");
    if (words.length === 0) return "";
    return words[0] + "...";
  };

  const displayText = getFirstWordWithEllipsis(message.text);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(() => onClose(message.id), 300); // Çıkış animasyonundan sonra onClose'u çağır
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, message.id]);

  // Toast konumu (index'e göre yukarıdan uzaklık)
  const topOffset = 16 + index * 56; // Her bir toast 48px + 8px boşluk

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed left-4 z-50 px-4 py-2 rounded-lg bg-green-500 text-white font-[MedievalSharp] shadow-lg"
          style={{ top: `${topOffset}px` }}
        >
          <div className="flex flex-col">
            <span className="font-bold text-xs">{message.sender}</span>
            <span className="font-medium">{displayText}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container bileşeni - maksimum 2 toast'ı gösterir
interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  messages,
  onClose,
}) => {
  // Maksimum 2 toast gösterilecek şekilde sınırlandırma
  const visibleMessages = messages.slice(0, 2);

  return (
    <>
      {visibleMessages.map((message, index) => (
        <Toast
          key={message.id}
          message={message}
          index={index}
          onClose={onClose}
        />
      ))}
    </>
  );
};
