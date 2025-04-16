import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface UserScore {
  username: string;
  score: number;
}

interface ScoreState {
  scores: UserScore[];
  isLoading: boolean;
  isScoreboardOpen: boolean;
  fetchScores: () => Promise<void>;
  updateUserScore: (
    userId: string,
    gameResult: "win" | "loss" | "stalemate"
  ) => Promise<void>;
  toggleScoreboard: () => void;
  setScoreboardOpen: (isOpen: boolean) => void;
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  scores: [],
  isLoading: false,
  isScoreboardOpen: false,

  fetchScores: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, score")
        .order("score", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching scores:", error);
        throw error;
      }

      const formattedData =
        data?.map((user) => ({
          username: user.username || "Unknown",
          score: user.score || 0,
        })) || [];

      set({ scores: formattedData });
    } catch (error) {
      console.error("Error in fetchScores:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserScore: async (
    userId: string,
    gameResult: "win" | "loss" | "stalemate"
  ) => {
    try {
      // Önce mevcut skoru al
      const { data: currentData, error: fetchError } = await supabase
        .from("users")
        .select("score")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      // Yeni skoru hesapla
      const currentScore = currentData?.score || 0;
      let scoreChange = 0;

      switch (gameResult) {
        case "win":
          scoreChange = 100;
          break;
        case "loss":
          scoreChange = -5;
          break;
        case "stalemate":
          scoreChange = 50;
          break;
      }

      const newScore = currentScore + scoreChange;

      // Skoru güncelle
      const { error: updateError } = await supabase
        .from("users")
        .update({ score: newScore })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Skorları yenile
      await get().fetchScores();

      return scoreChange;
    } catch (error) {
      console.error("Error updating score:", error);
      return 0;
    }
  },

  toggleScoreboard: () => {
    set((state) => ({ isScoreboardOpen: !state.isScoreboardOpen }));
  },

  setScoreboardOpen: (isOpen: boolean) => {
    set({ isScoreboardOpen: isOpen });
  },
}));
