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
  playerColor?: "white" | "black"; // Adding playerColor prop
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  playerNickname,
  opponentNickname,
  playerColor = "white", // Default to white if not specified
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  // Mesajları gruplandır
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
      {/* Chat icon fixed to top left */}
      <div className="fixed top-4 left-4 z-50 ">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#6B4423] text-[#DEB887] p-2 rounded-full hover:bg-[#8B5E34] transition-colors"
          title={isOpen ? "Sohbeti Kapat" : "Sohbeti Aç"}
        >
          <MessageCircle size={37} />
        </button>
      </div>

      {/* Chat window fixed to bottom center */}
      {isOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:w-96 max-w-[400px] h-96 bg-[#4A3728] rounded-lg shadow-xl border-2 border-[#8B5E34] flex flex-col z-50">
          {/* Oyuncu bilgileri */}
          <div className="p-2 sm:p-3 border-b border-[#8B5E34] bg-[#3D2E22]">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              {playerColor === "white" ? (
                <>
                  <div className="text-[#DEB887]">⚪ {playerNickname}</div>
                  <div className="text-[#DEB887]">⚫ {opponentNickname}</div>
                </>
              ) : (
                <>
                  <div className="text-[#DEB887]">⚫ {playerNickname}</div>
                  <div className="text-[#DEB887]">⚪ {opponentNickname}</div>
                </>
              )}
            </div>
          </div>

          {/* Mesajlar */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4 custom-scrollbar"
          >
            {groupedMessages.map((group, groupIndex) => (
              <div
                key={group[0].id}
                className={`flex flex-col ${
                  group[0].sender === playerNickname
                    ? "items-start"
                    : "items-end"
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
                      className={`px-3 py-2 rounded-lg max-w-[80%] break-words ${
                        msg.sender === playerNickname
                          ? "bg-[#8B5E34] text-[#DEB887]"
                          : "bg-[#6B4423] text-[#DEB887]"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {/* Sadece gruptaki son mesajda nickname'i göster */}
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

          {/* Mesaj gönderme formu */}
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
