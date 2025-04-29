import React, { useState, useRef, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";

interface ChatBoxProps {
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }>;
  onSendMessage: (text: string) => void;
  playerColor?: "white" | "black";
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  playerColor = "white",
}) => {
  const { playerNickname, opponentNickname } = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [message, setMessage] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [seenMessages, setSeenMessages] = useState<Set<string>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);

  // Dışarı tıklama olayını dinle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Yeni mesaj geldiğinde shadow animasyonunu başlat
  useEffect(() => {
    if (isCollapsed) {
      const newMessages = messages.filter(
        (msg) => !seenMessages.has(msg.id) && msg.sender !== playerNickname
      ).length;
      if (newMessages > 0) {
        setHasNewMessage(true);
      }
    }
  }, [messages, isCollapsed, seenMessages, playerNickname]);

  // Chat açıldığında mesajları okundu olarak işaretle
  useEffect(() => {
    if (!isCollapsed) {
      const newSeenMessages = new Set(seenMessages);
      messages.forEach((msg) => {
        if (msg.sender !== playerNickname) {
          newSeenMessages.add(msg.id);
        }
      });
      setSeenMessages(newSeenMessages);
      setHasNewMessage(false);
    }
  }, [isCollapsed, messages, playerNickname]);

  // Otomatik kaydırma
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isCollapsed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const groupedMessages = messages.reduce<Array<Array<(typeof messages)[0]>>>(
    (groups, message, index) => {
      if (index === 0 || messages[index - 1].sender !== message.sender) {
        groups.push([message]);
      } else {
        groups[groups.length - 1].push(message);
      }
      return groups;
    },
    []
  );

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          ref={chatBoxRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            boxShadow: hasNewMessage
              ? [
                  "0 0 0 rgba(239, 68, 68, 0)",
                  "0 0 20px rgba(239, 68, 68, 0.8)",
                  "0 0 0 rgba(239, 68, 68, 0)",
                ]
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="w-[calc(100vw-32px)] sm:w-96 max-w-[400px] bg-[#4A3728] rounded-lg shadow-xl border-2 border-[#8B5E34] flex flex-col"
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 p-2 sm:p-3 border-b border-[#8B5E34] bg-[#3D2E22] rounded-t-lg cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="px-3 py-1 rounded-lg bg-[#3D2E22] border border-[#8B5E34] flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    playerColor === "white" ? "bg-white" : "bg-black"
                  }`}
                />
                <span className="text-[#DEB887] font-[MedievalSharp]">
                  {playerNickname}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="mx-2 p-1 hover:bg-[#6B4423] rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-[#DEB887]" />
              </motion.div>
              <div className="px-3 py-1 rounded-lg bg-[#3D2E22] border border-[#8B5E34] flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    playerColor === "white" ? "bg-black" : "bg-white"
                  }`}
                />
                <span className="text-[#DEB887] font-[MedievalSharp]">
                  {opponentNickname || "?"}
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible content */}
          <motion.div
            initial={false}
            animate={{
              height: isCollapsed ? 0 : "auto",
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <div
              ref={chatContainerRef}
              className="h-72 overflow-y-auto p-2 sm:p-3 space-y-4 custom-scrollbar"
            >
              {groupedMessages.map((group) => (
                <div
                  key={group[0].id}
                  className={`flex flex-col ${
                    group[0].sender === playerNickname
                      ? "items-start"
                      : "items-end"
                  } space-y-1`}
                >
                  {group.map((msg, msgIndex) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === playerNickname
                          ? "items-start"
                          : "items-end"
                      } w-full`}
                    >
                      <div
                        className={`flex flex-col ${
                          msg.sender === playerNickname
                            ? "items-start"
                            : "items-end"
                        } min-w-[120px]`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            msg.sender === playerNickname
                              ? "bg-[#6B4423] text-[#DEB887] rounded-tl-none"
                              : "bg-[#8B5E34] text-[#DEB887] rounded-tr-none"
                          }`}
                          style={{
                            maxWidth: "85%",
                            width: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.text}
                        </div>
                        {msgIndex === group.length - 1 && (
                          <div
                            className={`text-xs text-[#DEB887]/60 mt-1 ${
                              msg.sender === playerNickname
                                ? "text-left"
                                : "text-right"
                            } w-full`}
                          >
                            {msg.sender === playerNickname
                              ? playerNickname
                              : opponentNickname}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-2 sm:p-3 border-t border-[#8B5E34]"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base rounded bg-[#6B4423] text-[#DEB887] placeholder-[#DEB887]/50 border border-[#8B5E34] focus:outline-none focus:ring-2 focus:ring-[#DEB887]"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-2 sm:px-3 py-2 bg-[#8B5E34] text-[#DEB887] rounded hover:bg-[#6B4423] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
