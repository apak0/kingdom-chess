import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);

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

  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

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
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-[#6B4423] text-[#DEB887] p-2 rounded-full hover:bg-[#8B5E34] transition-colors"
          title={isOpen ? "Sohbeti Kapat" : "Sohbeti Aç"}
        >
          <MessageCircle size={37} />
          {unreadCount > 0 && !isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {unreadCount}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:w-96 max-w-[400px] h-96 bg-[#4A3728] rounded-lg shadow-xl border-2 border-[#8B5E34] flex flex-col z-50">
          <div className="p-2 sm:p-3 border-b border-[#8B5E34] bg-[#3D2E22]">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              {playerColor === "white" ? (
                <>
                  <div className="text-[#DEB887]">
                    ⚪ {playerNickname || "Oyuncu"}
                  </div>
                  <div className="text-[#DEB887]">
                    ⚫ {opponentNickname || "Rakip"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[#DEB887]">
                    ⚫ {playerNickname || "Oyuncu"}
                  </div>
                  <div className="text-[#DEB887]">
                    ⚪ {opponentNickname || "Rakip"}
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4 custom-scrollbar"
          >
            {groupedMessages.map((group, groupIndex) => (
              <div
                key={group[0].id}
                className={`flex flex-col ${
                  group[0].sender === playerNickname
                    ? "items-end"
                    : "items-start"
                }`}
              >
                {group.map((msg, msgIndex) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msgIndex > 0 ? "mt-1" : "mt-0"
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.sender === playerNickname
                          ? "bg-[#8B5E34] text-[#DEB887] rounded-tr-none"
                          : "bg-[#6B4423] text-[#DEB887] rounded-tl-none"
                      }`}
                      style={{
                        maxWidth: "85%",
                        width: "auto",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        wordBreak: "keep-all",
                        overflowWrap: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                    {msgIndex === group.length - 1 && (
                      <div className="text-xs text-[#DEB887]/60 mt-1">
                        {msg.sender}
                      </div>
                    )}
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
        </div>
      )}
    </>
  );
};
