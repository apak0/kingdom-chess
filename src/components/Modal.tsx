import React from "react";
import { TimerBar } from "./TimerBar";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "check" | "checkmate";
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-center rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform">
        <div
          className={`text-2xl font-bold mb-4 ${
            type === "check" ? "text-amber-500" : "text-red-600"
          }`}
        >
          {title}
        </div>
        <p className="text-gray-700 mb-4">{message}</p>
        <TimerBar duration={3000} onComplete={onClose} />
      </div>
    </div>
  );
};
