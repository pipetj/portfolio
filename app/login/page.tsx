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
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Identifiants incorrects !");
      }

      const data = await response.json();
      setMessage("Connexion réussie !");
      console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur est survenue");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      background: 'linear-gradient(135deg, #0054b4 0%, #0094ff 100%)',
      fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif'
    }}>
      <div className="relative w-full max-w-lg">
        {/* Nostalgia elements */}
        <div className="absolute -top-8 -left-8 w-20 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center z-10 border-2 border-blue-400 transform rotate-0 hover:rotate-3 transition-transform duration-300">
          <div className="text-3xl">🪟</div>
        </div>
        
        {/* Modern glass card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white border-opacity-20">
          {/* Header with XP title bar style but modernized */}
          <div className="p-4 pl-20 border-b border-white border-opacity-20 flex items-center" style={{ 
            background: 'linear-gradient(90deg, #0066cc 0%, #3399ff 100%)'
          }}>
            <div className="text-white">
              <div className="flex items-center">
                <span className="text-2xl font-bold tracking-wide">Portfolio</span>
                <span className="text-2xl font-bold text-green-400 ml-1 glow">XP</span>
              </div>
              <div className="text-xs text-blue-100 opacity-80">Connexion sécurisée</div>
            </div>
          </div>
          
          {/* Content with modern styling but XP vibes */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-blue-300 border-opacity-30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  style={{ backdropFilter: 'blur(4px)' }}
                  placeholder="Entrez votre email"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-blue-300 border-opacity-30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  style={{ backdropFilter: 'blur(4px)' }}
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-white font-medium rounded-md shadow-md transition duration-300 transform hover:translate-y-1 focus:outline-none"
                  style={{ 
                    background: 'linear-gradient(90deg, #0066cc 0%, #3399ff 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <span className="flex items-center justify-center">
                    <span>Connexion</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 rounded-md bg-red-500 bg-opacity-30 border border-red-500 text-white">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {message && (
                <div className="mt-4 p-3 rounded-md bg-green-500 bg-opacity-30 border border-green-500 text-white">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">✓</span>
                    <span>{message}</span>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Footer with XP feel */}
          <div className="px-8 py-4 bg-blue-900 bg-opacity-30 border-t border-white border-opacity-10 flex justify-between items-center">
            <div className="text-xs text-blue-100">Portfolio XP Edition</div>
            <div className="text-xs text-blue-100">Experience nostalgique, design moderne</div>
          </div>
        </div>
      </div>
      
      {/* Style for glow effect on XP */}
      <style jsx>{`
        .glow {
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.7);
        }
      `}</style>
    </div>
  );
}