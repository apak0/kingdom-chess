import React, { useEffect, useState } from "react";
import "./TimerBar.css";

interface TimerBarProps {
  duration: number;
  onComplete: () => void;
}

export const TimerBar: React.FC<TimerBarProps> = ({ duration, onComplete }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="timer-bar-container">
      <div className="timer-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};
