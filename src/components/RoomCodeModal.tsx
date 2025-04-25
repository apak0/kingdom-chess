import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Copy } from "lucide-react";

interface RoomCodeModalProps {
  isOpen: boolean;
  roomId: string;
  onClose: () => void;
}

export const RoomCodeModal: React.FC<RoomCodeModalProps> = ({
  isOpen,
  roomId,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const gameUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    const message = `Hadi birlikte satranç oynayalım! Bağlantıya tıklayarak odama katıl: ${gameUrl}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(
        `whatsapp://send?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } else {
      window.open(
        `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        "_blank"
      );
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
            className="bg-[#4A3728] text-center rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-[#8B5E34]"
          >
            <h2 className="text-2xl font-[MedievalSharp] text-[#DEB887] mb-6">
              Oda Oluşturuldu
            </h2>
            <div className="flex flex-col gap-4">
              <div className="px-4 py-3 rounded-lg text-center text-2xl font-[MedievalSharp] bg-[#3D2E22] text-orange-300 text-bold border border-[#8B5E34]">
                Oda Kodu:{" "}
                <span className="font-sans text-red-500">{roomId}</span>
              </div>
              <p className="text-[#DEB887] text-sm mb-4 font-[MedievalSharp]">
                Arkadaşını davet etmek için oda kodunu paylaş
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={copyRoomId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FE7743] text-white px-4 py-2 rounded-lg hover:bg-[#FFA55D] transition-colors flex items-center gap-2"
                  title="Kodu Kopyala"
                >
                  <Copy size={20} />
                  <span>Kopyala</span>
                </motion.button>

                <motion.button
                  onClick={shareToWhatsApp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                  title="WhatsApp'ta Paylaş"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  <span>WhatsApp</span>
                </motion.button>
              </div>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm mt-2"
                >
                  Kopyalandı!
                </motion.div>
              )}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 text-lg font-[MedievalSharp] bg-[#8B5E34] text-[#DEB887] rounded hover:bg-[#6B4423] transition-colors duration-200 border border-[#DEB887]/30 hover:border-[#DEB887]/50"
              >
                Tamam
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
