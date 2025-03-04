"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "https://portfolio-spring-boot-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Identifiants incorrects !");
      }

      const data = await response.json();
      setMessage("Connexion réussie !");
      console.log(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3A6EA5]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      <div className="relative w-full max-w-md bg-gray-200 border border-gray-400 rounded-lg shadow-lg p-6">
        {/* XP Title Bar */}
        <div className="flex items-center justify-between bg-[#000080] text-white px-4 py-2 rounded-t-lg border-b border-gray-400">
          <span className="font-bold">Connexion - Portfolio XP</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-gray-300"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-gray-300"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full border border-gray-300"></div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-black text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-inner bg-white text-black focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-black text-sm font-bold mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-inner bg-white text-black focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0078D7] text-white py-2 rounded-md border border-gray-400 shadow-md transition hover:bg-[#0054b4]"
          >
            Connexion
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-200 border border-red-500 text-black rounded-md">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-200 border border-green-500 text-black rounded-md">
            ✓ {message}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-700">Windows XP Style - Portfolio Edition</div>
      </div>
    </div>
  );
}
