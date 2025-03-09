"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const username = "Pipet Jordan"; 

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3A6EA5]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
        <div className="relative w-full max-w-md bg-gray-200 border border-gray-400 rounded-lg shadow-lg p-6">
          {/* XP Title Bar */}
          <div className="flex items-center justify-between bg-[#000080] text-white px-4 py-2 rounded-t-lg border-b border-gray-400">
            <span className="font-bold">Connexion - Windows XP</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-gray-300"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-gray-300"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full border border-gray-300"></div>
            </div>
          </div>

          {/* Login Content */}
          <div className="mt-4 text-center">
            <div className="text-black text-lg mb-4">Bienvenue, {username}</div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#0078D7] text-white py-2 rounded-md border border-gray-400 shadow-md transition hover:bg-[#0054b4]"
            >
              Se connecter
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-700">Windows XP Style</div>
        </div>
      </div>
    );
  }

  // Interface Windows XP après connexion
  return (
    <div className="min-h-screen bg-[#3A6EA5]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      {/* Desktop */}
      <div className="h-full w-full p-4">
        {/* Start Button et Taskbar */}
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-gray-200 border-t border-gray-400 flex items-center px-2">
          <button className="bg-[#0078D7] text-white px-4 py-1 rounded-sm flex items-center gap-2 hover:bg-[#0054b4]">
            <span className="font-bold">Démarrer</span>
          </button>
          <div className="ml-auto text-sm text-black">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Desktop Icons - Vous pouvez en ajouter d'autres */}
        <div className="p-2">
          <div className="flex flex-col items-center w-20 cursor-pointer">
            <div className="w-10 h-10 bg-gray-300 border border-gray-400 mb-1"></div>
            <span className="text-white text-xs text-center">Mon PC</span>
          </div>
        </div>
      </div>
    </div>
  );
}