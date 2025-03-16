"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [title, setTitle] = useState("");
  const fullTitle = "Je vous souhaite la bienvenue sur mon portfolio";

  // Effet de typing pour le titre
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullTitle.length) {
        setTitle(fullTitle.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, []);

  // Fonction pour télécharger le CV
  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = "/CV_Pipet_Jordan.pdf"; // Chemin relatif depuis /public
    link.download = "CV_Pipet_Jordan.pdf"; // Nom du fichier téléchargé
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-[family-name:var(--font-geist-sans)] relative overflow-hidden">
      {/* Particules simplifiées en CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}vh`,
              left: `${Math.random() * 100}vw`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <main className="flex-grow flex flex-col items-center justify-center z-10 px-4 py-12">
        {/* Titre avec effet de typing */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            {title}
            <span className="animate-pulse">|</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto mt-4">
            Venez découvrir mes projets de développement web et autres, réalisés durant mon cursus !
          </p>
        </div>

        {/* Cartes d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* À propos */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400 flex items-center">
              <span className="mr-2">→</span>
              À propos de moi
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Je m’appelle Jordan Pipet, né en 2004 dans la Drôme. Depuis toujours passionné d’informatique, j’ai vite compris que je voulais en faire mon métier. En dehors de cela, j’aime les jeux de stratégie comme les échecs et la musique, où j’apprends à jouer du piano. Curieux de nature, j’apprécie me cultiver et découvrir de nouvelles choses.
            </p>
          </div>

          {/* Mon cursus (anciennement Compétences) */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-teal-400 flex items-center">
              <span className="mr-2">→</span>
              Mon cursus
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Je suis actuellement en 3e année de BUT MMI, après avoir obtenu mon BTS Systèmes Numériques et un baccalauréat HGGSP/LLCE avec mention assez bien. Ce parcours m’a permis d’acquérir des compétences variées en informatique : développement web avec des langages comme JavaScript et PHP, ainsi que des frameworks tels que React et Next.js ; mais aussi des langages orientés objets et systèmes comme Java, Python et C++.
            </p>
          </div>
        </div>

        {/* Bouton projets */}
        <a href="/login">
          <button className="mt-12 relative px-8 py-4 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
            Voir mes projets
          </button>
        </a>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 bg-gray-900/90 border-t border-gray-800 z-10 mt-auto">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <button
            onClick={handleDownloadCV}
            className="relative px-8 py-4 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300"
          >
            Mon CV
          </button>

          <div className="flex space-x-4">
            <a
              href="https://fr.linkedin.com/in/jordan-pipet-438943251"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600/20 rounded-full hover:scale-110 transition-transform duration-300"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a
              href="https://github.com/pipetj"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-700/20 rounded-full hover:scale-110 transition-transform duration-300"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Animation CSS pour les particules */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, 20px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}