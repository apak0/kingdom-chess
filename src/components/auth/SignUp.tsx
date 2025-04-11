import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { AuthError } from "@supabase/supabase-js";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signUp(email, password, username);
      // Successful signup will automatically log the user in
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#6B4423] rounded-lg shadow-xl border-4 border-[#4A3728]">
      <h2 className="text-2xl font-[MedievalSharp] text-[#FFD700] text-center mb-6">
        Sign Up
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-500 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-[#DEB887] mb-2 font-[MedievalSharp]"
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-[#5C3A21] border border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-[#DEB887]"
            required
          />
        </div>
        <div>
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
            className="w-full p-2 bg-[#5C3A21] border border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-[#DEB887]"
            required
          />
        </div>
        <div>
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
            className="w-full p-2 bg-[#5C3A21] border border-[#8B4513] rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-[#DEB887]"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full relative px-6 py-3 font-[MedievalSharp] text-[#3E2613] text-4xl tracking-widest uppercase rounded-md border-2 border-[#A0522D] bg-gradient-to-br from-[#D2B48C] to-[#BC8F8F] shadow-lg shadow-[#5c3a21]/40 transition-all duration-300 hover:brightness-105 hover:shadow-xl hover:shadow-[#5c3a21]/60 active:translate-y-1 active:shadow-none"
          disabled={isLoading}
        >   
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};
