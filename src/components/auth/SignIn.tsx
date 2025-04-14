import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-[#4A3728] p-6 rounded-lg shadow-lg border-2 border-[#8B4513]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4"
        >
          {error}
        </motion.div>
      )}

      <div className="mb-4">
        <label
          className="block text-[#DEB887] mb-2 font-[MedievalSharp]"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-[#3A2718] text-[#DEB887] border border-[#8B4513] focus:outline-none focus:border-[#FFD700] transition-colors"
          required
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-[#DEB887] mb-2 font-[MedievalSharp]"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#3A2718] text-[#DEB887] border border-[#8B4513] focus:outline-none focus:border-[#FFD700] transition-colors"
          required
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full bg-[#8B4513] text-[#FFD700] p-3 rounded font-[MedievalSharp] hover:bg-[#6B4423] transition-colors"
      >
        Sign In
      </motion.button>
    </motion.form>
  );
};
