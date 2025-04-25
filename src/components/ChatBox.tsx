import React, { useState, useRef, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface ChatBoxProps {
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }>;
  onSendMessage: (text: string) => void;
  playerNickname: string;
  opponentNickname: string;
  playerColor?: "white" | "black";
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  playerNickname,
  opponentNickname,
  playerColor = "white",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node) &&
        event.target instanceof Element &&
        !event.target.closest('button[title="Sohbeti Kapat"]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    // If there are new messages and chat is closed, increment unread count
    if (!isOpen && messages.length > lastMessageCountRef.current) {
      setUnreadCount(
        (prev) => prev + (messages.length - lastMessageCountRef.current)
      );
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0); // Reset unread count when chat is opened
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive or chat is opened/uncollapsed
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };

    // Immediate scroll
    scrollToBottom();

    // Add a small delay to ensure content is rendered
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
      {/* Move toggle button to the top center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          ref={chatBoxRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[calc(100vw-32px)] sm:w-96 max-w-[400px] bg-[#4A3728] rounded-lg shadow-xl border-2 border-[#8B5E34] flex flex-col"
        >
          {/* Header with players */}
          <div className="sticky top-0 z-10 p-2 sm:p-3 border-b border-[#8B5E34] bg-[#3D2E22] rounded-t-lg">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex-1 text-[#DEB887]">
                {playerColor === "white" ? "⚪" : "⚫"}{" "}
                {playerNickname || "Oyuncu"}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mx-2 p-1 hover:bg-[#6B4423] rounded-full transition-colors"
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#DEB887]" />
                </motion.div>
              </button>
              <div className="flex-1 text-right text-[#DEB887]">
                {playerColor === "white" ? "⚫" : "⚪"}{" "}
                {opponentNickname || "Rakip"}
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
                        group[0].sender === playerNickname
                          ? "items-start"
                          : "items-end"
                      } w-full`}
                    >
                      <div
                        className={`flex flex-col ${
                          group[0].sender === playerNickname
                            ? "items-start"
                            : "items-end"
                        } min-w-[120px]`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            msg.sender === playerNickname
                              ? "bg-[#8B5E34] text-[#DEB887] rounded-tl-none"
                              : "bg-[#6B4423] text-[#DEB887] rounded-tr-none"
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
                            {msg.sender}
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

          {unreadCount > 0 && isCollapsed && (
            <div className="absolute -top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {unreadCount}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
