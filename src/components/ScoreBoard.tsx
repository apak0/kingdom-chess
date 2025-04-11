import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useScoreStore } from "../store/scoreStore";

export const ScoreBoard: React.FC = () => {
  const { scores, isLoading, isScoreboardOpen, fetchScores, toggleScoreboard } =
    useScoreStore();

  useEffect(() => {
    if (isScoreboardOpen) {
      fetchScores();
    }
  }, [isScoreboardOpen, fetchScores]);

  if (!isScoreboardOpen) {
    return (
      <button
        onClick={toggleScoreboard}
        className="fixed top-4 left-4 z-50 bg-[#8B4513] p-3 rounded-lg shadow-lg hover:bg-[#A0522D] transition-colors"
        title="Open Scoreboard"
      >
        <Trophy className="w-6 h-6 text-[#FFD700]" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="fixed top-4 left-4 z-50 w-80"
      >
        <div className="relative bg-[#8B4513] rounded-lg p-4 shadow-2xl border-4 border-[#4A3728]">
          {/* Tahta doku efekti */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCI+CiAgPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjOEI0NTEzIi8+CiAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjIiIGZpbGw9IiM0QTM3MjgiLz4KPC9zdmc+')] opacity-10 rounded-lg" />

          {/* Başlık */}
          <div className="relative flex justify-between items-center mb-4">
            <h2 className="text-2xl font-[MedievalSharp] text-[#FFD700] flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Leaderboard
            </h2>
            <button
              onClick={toggleScoreboard}
              className="text-[#FFD700] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Skor listesi */}
          <div className="relative max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-4 text-[#DEB887]">Loading...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[#FFD700] font-[MedievalSharp]">
                    <th className="py-2 text-left">Rank</th>
                    <th className="py-2 text-left">Player</th>
                    <th className="py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr
                      key={score.username}
                      className="text-[#DEB887] border-t border-[#4A3728]/30"
                    >
                      <td className="py-2 font-[MedievalSharp]">
                        #{index + 1}
                      </td>
                      <td className="py-2">{score.username}</td>
                      <td className="py-2 text-right">{score.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Çivi efektleri */}
          <div className="absolute -left-2 -top-2 w-4 h-4 bg-[#B8860B] rounded-full shadow-lg" />
          <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#B8860B] rounded-full shadow-lg" />
          <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#B8860B] rounded-full shadow-lg" />
          <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-[#B8860B] rounded-full shadow-lg" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
