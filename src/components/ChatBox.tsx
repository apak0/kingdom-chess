import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  playerNickname: string;
  opponentNickname: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  playerNickname,
  opponentNickname,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde bildirim sayacını güncelle
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, isOpen]);

  // Chat açıldığında bildirimleri sıfırla ve en son mesaja kaydır
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  // Mesajları gruplara ayır ve son mesajı işaretle
  const groupedMessages = messages.reduce(
    (groups: Message[][], message, index) => {
      if (index === 0) {
        groups.push([{ ...message, isLastInGroup: true }]);
        return groups;
      }

      const lastGroup = groups[groups.length - 1];
      const lastMessage = lastGroup[lastGroup.length - 1];

      if (lastMessage.sender === message.sender) {
        // Son mesajın isLastInGroup özelliğini false yap
        lastGroup[lastGroup.length - 1] = {
          ...lastMessage,
          isLastInGroup: false,
        };
        // Yeni mesajı ekle ve son mesaj olarak işaretle
        lastGroup.push({ ...message, isLastInGroup: true });
      } else {
        groups.push([{ ...message, isLastInGroup: true }]);
      }

      return groups;
    },
    []
  );

  return (
    <>
      {/* Chat İkonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#6B4423] p-2 sm:p-3 rounded-full shadow-lg hover:bg-[#8B5E34] transition-colors"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#DEB887]" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed bottom-0 left-4 right-4 sm:left-[50%] sm:right-auto sm:bottom-8 sm:translate-x-[-50%] w-auto sm:w-[33.333vw] bg-[#4A3728] shadow-xl border-t-2 sm:border-2 border-[#8B5E34] sm:rounded-lg h-[40vh] sm:h-[45vh] flex flex-col"
          >
            {/* Başlık */}
            <div className="flex justify-between items-center p-2 sm:p-3 border-b border-[#8B5E34] shrink-0">
              <h3 className="text-base sm:text-lg font-[MedievalSharp] text-[#DEB887]">
                Sohbet
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#DEB887] hover:text-[#8B5E34] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mesajlar Alanı */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar min-h-0">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  {group.map((message, messageIndex) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.sender === playerNickname
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          message.sender === playerNickname
                            ? "bg-[#8B5E34] ml-auto"
                            : "bg-[#6B4423]"
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-[MedievalSharp] text-[#DEB887] break-words">
                          {message.text}
                        </p>
                      </div>
                      {message.isLastInGroup && (
                        <span className="text-[10px] sm:text-xs text-[#DEB887]/60 mt-0.5">
                          {message.sender === playerNickname
                            ? "Sen"
                            : opponentNickname}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Gönderme Formu */}
            <form
              onSubmit={handleSubmit}
              className="p-2 border-t border-[#8B5E34] shrink-0 bg-[#4A3728]"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-2 py-1.5 text-xs sm:text-sm rounded bg-[#6B4423] text-[#DEB887] placeholder-[#DEB887]/50 border border-[#8B5E34] focus:outline-none focus:ring-2 focus:ring-[#DEB887]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-2 py-1.5 text-xs sm:text-sm bg-[#8B5E34] text-[#DEB887] rounded hover:bg-[#6B4423] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Gönder
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
