"use client";

import { useEffect, useState, useRef } from "react";
import PyProject from '../PyProject/page';
import RobotObject from '../RobotObject/page';
import Pinball from '../pinball/page';

// Interfaces
interface WindowItem {
  id: number;
  type: string;
  minimized: boolean;
  maximized?: boolean;
  linkedDetailId?: number;
  position?: { x: number; y: number };
}

interface Project {
  id: string;
  title: string;
  description: string;
  user_id: string;
}

export default function LoginPage() {
  const [stage, setStage] = useState<"démarrage" | "connexion" | "animationConnexion" | "bureau" | "shutdown">("démarrage");
  const [loading, setLoading] = useState<boolean>(false);
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "a36252be-5d6c-445e-8b3f-b175e3465348",
      title: "Pixel Art",
      description: "Ce projet a été réalisé au tout début de mon BTS en une quinzaine d’heures et servait d’initiation au code. Le principe était d’utiliser la librairie Python OpenCV pour afficher un texte en style pixel art saisi par un utilisateur. Cela permettait de comprendre les bases de la programmation (variables, conditions, boucles, frameworks). J’ai reproduit ce projet dans mon portfolio en l’étoffant : personnalisation de la couleur, changement de message, et ajout d’un mini-jeu Snake pour un style rétro arcade. En conclusion, ce projet est la base de tous les suivants.",
      user_id: "pipetj",
    },
    {
      id: "4197520e-c9ed-4d2c-8ac1-54db51c40327",
      title: "Programmation embarqué",
      description: "Ce projet de fin de première année de BTS, réalisé en groupe sur 4 mois (100 heures), consistait à contrôler un robot attaché à une Arduino via un site web que j’ai développé. Une API envoyait des requêtes AJAX pour exécuter les déplacements, et un capteur ultrasonique permettait d’esquiver les obstacles. J’ai reproduit ce projet en 3D dans mon portfolio pour refléter ses capacités.",
      user_id: "pipetj",
    },
    {
      id: "e317f069-708e-4c38-81bd-96dce6b36fde",
      title: "Développement Mobile",
      description: "Initiation au développement Android et Java, réalisée en binôme en 20 heures. L’application, axée sur le développement durable, permet de suivre sa consommation énergétique, la comparer à la moyenne française, et fixer des objectifs. Ce projet a mis en pratique la programmation orientée objet et élargi mes compétences hors du web.",
      user_id: "pipetj",
    },
    {
      id: "3763c6c8-c6d1-40cc-be5d-cca06771f0f9",
      title: "Projet Blog",
      description: "Initiation à React et Next.js, réalisée en groupe en 30 heures. Ce site, connecté à une base Prisma, permettait connexion, commentaires, quiz, et gestion de rôles pour éditer/supprimer des données. Ce projet a ouvert de nouvelles perspectives grâce aux frameworks web. Une démonstration est disponible.",
      user_id: "pipetj",
    },
    {
      id: "bdfee76e-6cc4-421d-b338-be2b55d175e4",
      title: "Escape Game",
      description: "Projet de fin de semestre 5 en BUT MMI, réalisé en groupe de 5 sur 4 mois. Nous avons conçu un escape game jouable sur navigateur (scénario, énigmes, développement) pour mobile, utilisant gyroscope, micro, caméra et accéléromètre. Quelques images illustrent mes pages.",
      user_id: "pipetj",
    },
  ]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const username = "Pipet Jordan";
  const dragRef = useRef<{ id: number | null; offsetX: number; offsetY: number }>({ id: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedBackground = document.cookie.split('; ').find(row => row.startsWith('backgroundImage='))?.split('=')[1];
    if (savedBackground) setBackgroundImage(savedBackground);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setStage("connexion");
    }, 3000);
  }, []);

  useEffect(() => {
    if (stage === "bureau") {
      fetch('/portfolio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(`Erreur HTTP ! statut : ${res.status}`);
          return res.json();
        })
        .then((data: Project[]) => {
          console.log("Projets récupérés :", data);
          setProjects(data.length > 0 ? data : projects);
        })
        .catch(err => {
          console.error("Erreur lors de la récupération des projets :", err);
          setProjects(projects);
        });
    }
  }, [stage]);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setStage("animationConnexion");
      setTimeout(() => {
        setStage("bureau");
      }, 2000);
    }, 800);
  };

  const openWindow = (type: string, linkedDetailId?: number) => {
    const centerX = (window.innerWidth - 800) / 2;
    const centerY = (window.innerHeight - 600) / 2;
    setWindows(prev => [...prev, {
      id: Date.now(),
      type,
      minimized: false,
      maximized: false,
      linkedDetailId,
      position: { x: centerX > 0 ? centerX : 100, y: centerY > 0 ? centerY : 100 }
    }]);
  };

  const closeWindow = (id: number) => {
    setWindows(prev => {
      const windowToClose = prev.find(w => w.id === id);
      if (windowToClose?.type === 'projets' || windowToClose?.type === 'pyproject' || windowToClose?.type === 'robotobject' || windowToClose?.type === 'background' || windowToClose?.type === 'pinball') {
        return prev.filter(w => w.id !== id && w.linkedDetailId !== id);
      }
      return prev.filter(w => w.id !== id);
    });
  };

  const toggleMinimize = (id: number) => {
    setWindows(prev => {
      const windowToToggle = prev.find(w => w.id === id);
      if (windowToToggle?.type === 'projets' || windowToToggle?.type === 'pyproject' || windowToToggle?.type === 'robotobject' || windowToToggle?.type === 'background' || windowToToggle?.type === 'pinball') {
        return prev.map(w =>
          w.id === id || w.linkedDetailId === id
            ? { ...w, minimized: !w.minimized }
            : w
        );
      }
      return prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w);
    });
  };

  const toggleMaximize = (id: number) => {
    setWindows(prev => {
      const windowToToggle = prev.find(w => w.id === id);
      if (windowToToggle?.type === 'projets' || windowToToggle?.type === 'pyproject' || windowToToggle?.type === 'robotobject' || windowToToggle?.type === 'background' || windowToToggle?.type === 'pinball') {
        return prev.map(w =>
          w.id === id || w.linkedDetailId === id
            ? { ...w, maximized: !w.maximized }
            : w
        );
      }
      return prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w);
    });
  };

  const openProjectDetails = (projectId: string, projectsWindowId: number) => {
    const existingDetail = windows.find(w => w.type === `projet-${projectId}` && w.linkedDetailId === projectsWindowId);
    if (!existingDetail) {
      openWindow(`projet-${projectId}`, projectsWindowId);
    }
  };

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    openWindow(type);
  };

  const handleBackgroundSave = (url: string) => {
    setBackgroundImage(url);
    document.cookie = `backgroundImage=${url}; max-age=${60 * 60 * 24 * 30}`;
  };

  const handleBackgroundReset = () => {
    setBackgroundImage(null);
    document.cookie = `backgroundImage=; max-age=0`;
  };

  const handleLogout = () => {
    setShowStartMenu(false);
    setStage("shutdown");
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/CV_Pipet_Jordan.pdf';
    link.download = 'CV_Pipet_Jordan.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startDragging = (e: React.MouseEvent, id: number) => {
    const windowObj = windows.find(w => w.id === id);
    if (windowObj && !windowObj.maximized) {
      dragRef.current = {
        id,
        offsetX: e.clientX - (windowObj.position?.x || 0),
        offsetY: e.clientY - (windowObj.position?.y || 0),
      };
      e.preventDefault();
    }
  };

  const stopDragging = () => {
    dragRef.current.id = null;
  };

  const onDrag = (e: React.MouseEvent) => {
    if (dragRef.current.id !== null) {
      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 800));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 600));
      setWindows(prev =>
        prev.map(w =>
          w.id === dragRef.current.id
            ? { ...w, position: { x: boundedX, y: boundedY } }
            : w
        )
      );
    }
  };

  if (stage === "démarrage") {
    return (
      <div className="boot-container">
        <div className="boot-content">
          <div className="logo-container">
            <div className="windows-logo">
              <div className="grid grid-cols-2 gap-1">
                <div className="logo-tile tile-1"></div>
                <div className="logo-tile tile-2"></div>
                <div className="logo-tile tile-3"></div>
                <div className="logo-tile tile-4"></div>
              </div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="boot-text">Initialisation de l'expérience portfolio...</p>
        </div>
        <style jsx>{`
          .boot-container {
            min-height: 100vh;
            background: black;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .boot-content {
            width: 100%;
            max-width: 28rem;
            text-align: center;
          }
          .logo-container {
            margin-bottom: 2rem;
          }
          .windows-logo {
            width: 8rem;
            height: 8rem;
            margin: 0 auto;
            position: relative;
          }
          .logo-tile {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 0.125rem;
            animation: pulse 1.5s infinite;
          }
          .tile-1 { background: #f25022; }
          .tile-2 { background: #7fba00; animation-delay: 0.2s; }
          .tile-3 { background: #00a4ef; animation-delay: 0.4s; }
          .tile-4 { background: #ffb900; animation-delay: 0.6s; }
          .progress-bar {
            width: 16rem;
            height: 0.25rem;
            margin: 0 auto;
            background: #374151;
            border-radius: 9999px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: #3b82f6;
            width: 0;
            animation: progress 3s linear forwards;
          }
          .boot-text {
            margin-top: 1.5rem;
            color: white;
            font-size: 0.875rem;
            font-weight: 300;
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes progress {
            0% { width: 0; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (stage === "connexion") {
    return (
      <div className="login-container">
        <div className="background-effects">
          <div className="float-circle circle-1"></div>
          <div className="float-circle circle-2"></div>
        </div>
        <div className="login-card">
          <div className="card-header">
            <span>Connexion au Portfolio</span>
          </div>
          <div className="card-content">
            <div className="avatar-container">
              <div className="avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
            <div className="user-info">
              <h2>{username}</h2>
              <p>Portfolio Développeur</p>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="sign-in-button"
            >
              {loading ? "Connexion en cours..." : "Se Connecter"}
            </button>
            <div className="hint-text">
              <p>Appuyez sur Entrée pour vous connecter à votre portfolio</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .login-container {
            min-height: 100vh;
            background: url("/api/placeholder/1920/1080") center/cover;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
          }
          .login-container:before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom right, rgba(30,58,138,0.7), rgba(107,33,168,0.7));
            backdrop-filter: blur(2px);
          }
          .background-effects {
            position: absolute;
            inset: 0;
            overflow: hidden;
          }
          .float-circle {
            position: absolute;
            border-radius: 9999px;
            animation: float 6s infinite ease-in-out;
          }
          .circle-1 {
            top: 25%;
            left: 25%;
            width: 16rem;
            height: 16rem;
            background: rgba(59,130,246,0.2);
            filter: blur(6rem);
          }
          .circle-2 {
            bottom: 33%;
            right: 33%;
            width: 24rem;
            height: 24rem;
            background: rgba(147,51,234,0.2);
            filter: blur(6rem);
            animation-delay: 1s;
          }
          .login-card {
            position: relative;
            width: 24rem;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(6px);
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            overflow: hidden;
          }
          .card-header {
            background: linear-gradient(to right, #2563eb, #4f46e5);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
          }
          .card-header span {
            color: white;
            font-weight: 500;
            font-size: 1.125rem;
          }
          .card-content {
            padding: 2rem;
          }
          .avatar-container {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
          }
          .avatar {
            width: 6rem;
            height: 6rem;
            background: linear-gradient(to bottom right, #60a5fa, #4f46e5);
            border-radius: 9999px;
            padding: 0.25rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .avatar svg {
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 9999px;
            padding: 0.5rem;
          }
          .user-info {
            text-align: center;
            margin-bottom: 2rem;
          }
          .user-info h2 {
            color: white;
            font-size: 1.25rem;
            font-weight: 700;
          }
          .user-info p {
            color: #bfdbfe;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
          .sign-in-button {
            width: 100%;
            background: linear-gradient(to right, #3b82f6, #4f46e5);
            padding: 0.5rem 2rem;
            border-radius: 0.5rem;
            font-weight: 500;
            color: white;
            box-shadow: 0 4px 6px rgba(59,130,246,0.3);
            transition: all 0.3s;
          }
          .sign-in-button:hover:not(:disabled) {
            box-shadow: 0 6px 8px rgba(59,130,246,0.5);
            transform: translateY(-2px);
          }
          .sign-in-button:active:not(:disabled) {
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            transform: translateY(0);
          }
          .sign-in-button:disabled {
            opacity: 0.7;
            cursor: wait;
          }
          .hint-text {
            margin-top: 1.5rem;
            text-align: center;
            color: rgba(191,219,254,0.8);
            font-size: 0.75rem;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  if (stage === "animationConnexion") {
    return (
      <div className="login-animation-container">
        <div className="animation-content">
          <div className="welcome-message">
            <h1>Bienvenue, {username}</h1>
            <p>Préparation de votre environnement de portfolio</p>
          </div>
          <div className="spinner">
            <div className="spinner-bg"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
        <style jsx>{`
          .login-animation-container {
            min-height: 100vh;
            background: linear-gradient(to bottom right, #1e3a8a, #4f46e5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .animation-content {
            text-align: center;
          }
          .welcome-message {
            margin-bottom: 2rem;
          }
          .welcome-message h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: white;
            animation: fadeIn 0.5s;
          }
          .welcome-message p {
            color: #bfdbfe;
            margin-top: 0.5rem;
            animation: fadeIn 0.5s 0.3s backwards;
          }
          .spinner {
            width: 4rem;
            height: 4rem;
            margin: 0 auto;
            position: relative;
            animation: spin 1s infinite linear;
          }
          .spinner-bg {
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border: 4px solid rgba(191,219,254,0.3);
          }
          .spinner-ring {
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border: 4px solid transparent;
            border-top-color: #60a5fa;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (stage === "shutdown") {
    return (
      <div className="shutdown-container">
        <div className="shutdown-content">
          <div className="logo-container">
            <div className="windows-logo">
              <div className="grid grid-cols-2 gap-1">
                <div className="logo-tile tile-1"></div>
                <div className="logo-tile tile-2"></div>
                <div className="logo-tile tile-3"></div>
                <div className="logo-tile tile-4"></div>
              </div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="shutdown-text">Déconnexion en cours...</p>
        </div>
        <style jsx>{`
          .shutdown-container {
            min-height: 100vh;
            background: black;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .shutdown-content {
            width: 100%;
            max-width: 28rem;
            text-align: center;
          }
          .logo-container {
            margin-bottom: 2rem;
          }
          .windows-logo {
            width: 8rem;
            height: 8rem;
            margin: 0 auto;
          }
          .logo-tile {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 0.125rem;
            animation: pulse 1.5s infinite;
          }
          .tile-1 { background: #f25022; }
          .tile-2 { background: #7fba00; animation-delay: 0.2s; }
          .tile-3 { background: #00a4ef; animation-delay: 0.4s; }
          .tile-4 { background: #ffb900; animation-delay: 0.6s; }
          .progress-bar {
            width: 16rem;
            height: 0.25rem;
            margin: 0 auto;
            background: #374151;
            border-radius: 9999px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: #ef4444;
            width: 0;
            animation: progress 3s linear forwards;
          }
          .shutdown-text {
            margin-top: 1.5rem;
            color: white;
            font-size: 0.875rem;
            font-weight: 300;
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes progress {
            0% { width: 0; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="desktop-container" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }} onMouseMove={onDrag} onMouseUp={stopDragging}>
      <div className="background-effects">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
      </div>

      <div className="desktop-icons">
        <div className="icon-container" onClick={(e) => handleIconClick(e, 'projets')}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="icon-label">Projets</span>
        </div>

        <div className="icon-container" onClick={(e) => handleIconClick(e, 'pyproject')}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="icon-label">Pixel Art</span>
        </div>

        <div className="icon-container" onClick={(e) => handleIconClick(e, 'robotobject')}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 18v-2a4 4 0 00-8 0v2m-4-6h16M6 8h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="icon-label">Smartbot 3D</span>
        </div>

        <div className="icon-container" onClick={(e) => handleIconClick(e, 'pinball')}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4m8-8v16M8 16l-4 4m12-4l4 4" />
            </svg>
          </div>
          <span className="icon-label">Pinball</span>
        </div>

        <div className="icon-container" onClick={(e) => handleIconClick(e, 'background')}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="icon-label">Fond d'écran</span>
        </div>
      </div>

      {windows.map(window => (
        !window.minimized && (
          window.type === 'projets' ? (
            <div
              key={window.id}
              className={`window ${window.maximized ? 'maximized' : ''}`}
              style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
            >
              <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                <span>Projets - Pipet Jordan</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleMaximize(window.id)} className="control maximize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d={window.maximized ? "M5 16h14V8H5v8zm14 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" : "M5 19h14V5H5v14zm14 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"} />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content project-window">
                <h1 className="project-title">Mes Projets</h1>
                {projects.length > 0 ? (
                  <div className="project-grid">
                    {projects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="project-card-inner">
                          <h2 className="project-card-title">{project.title}</h2>
                          <p className="project-card-desc">{project.description}</p>
                          <button
                            onClick={() => openProjectDetails(project.id, window.id)}
                            className="project-card-button"
                          >
                            Voir les Détails
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-projects">Aucun projet disponible pour le moment.</p>
                )}
              </div>
            </div>
          ) : window.type === 'pyproject' ? (
            <div
              key={window.id}
              className={`window ${window.maximized ? 'maximized' : ''}`}
              style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
            >
              <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                <span>PyProject - Pipet Jordan</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleMaximize(window.id)} className="control maximize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d={window.maximized ? "M5 16h14V8H5v8zm14 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" : "M5 19h14V5H5v14zm14 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"} />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content">
                <PyProject />
              </div>
            </div>
          ) : window.type === 'robotobject' ? (
            <div
              key={window.id}
              className={`window ${window.maximized ? 'maximized' : ''}`}
              style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
            >
              <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                <span>RobotObject - Pipet Jordan</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleMaximize(window.id)} className="control maximize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d={window.maximized ? "M5 16h14V8H5v8zm14 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" : "M5 19h14V5H5v14zm14 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"} />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content">
                <RobotObject />
              </div>
            </div>
          ) : window.type === 'background' ? (
            <div
              key={window.id}
              className={`window ${window.maximized ? 'maximized' : ''}`}
              style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
            >
              <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                <span>Paramètres du Fond d'écran</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleMaximize(window.id)} className="control maximize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d={window.maximized ? "M5 16h14V8H5v8zm14 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" : "M5 19h14V5H5v14zm14 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"} />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content">
                <h2>Choisir un fond d'écran</h2>
                <input
                  type="text"
                  placeholder="Entrez l'URL de l'image"
                  className="background-input"
                  id={`background-input-${window.id}`}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(`background-input-${window.id}`) as HTMLInputElement;
                    if (input && input.value) {
                      handleBackgroundSave(input.value);
                      closeWindow(window.id);
                    }
                  }}
                  className="validate-button"
                >
                  Valider
                </button>
                <button
                  onClick={() => {
                    handleBackgroundReset();
                    closeWindow(window.id);
                  }}
                  className="reset-button"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          ) : window.type === 'pinball' ? (
            <div
              key={window.id}
              className={`window ${window.maximized ? 'maximized' : ''}`}
              style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
            >
              <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                <span>Pinball - Pipet Jordan</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleMaximize(window.id)} className="control maximize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d={window.maximized ? "M5 16h14V8H5v8zm14 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" : "M5 19h14V5H5v14zm14 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"} />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content">
                <Pinball />
              </div>
            </div>
          ) : window.type.startsWith('projet-') ? (
            (() => {
              const projectId = window.type.split('projet-')[1];
              const project = projects.find(p => p.id === projectId);

              return (
                <div
                  key={window.id}
                  className="window detail-window"
                  style={!window.maximized ? { left: `${window.position?.x}px`, top: `${window.position?.y}px` } : undefined}
                >
                  <div className="window-header" onMouseDown={(e) => startDragging(e, window.id)}>
                    <span>Détails du Projet - {project?.title || 'Inconnu'}</span>
                    <div className="window-controls">
                      <button onClick={() => closeWindow(window.id)} className="control back">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="window-content project-window">
                    <h2>{project?.title || 'Titre non disponible'}</h2>

                    {/* Pixel Art */}
                    {project?.id === "a36252be-5d6c-445e-8b3f-b175e3465348" && (
                      <div>
                        <p>Ce projet a été réalisé au tout début de mon BTS en une quinzaine d’heures et servait donc d’initiation au code. Le principe était d’utiliser la librairie Python OpenCV pour afficher un texte en façon pixel art qu’un utilisateur avait saisi. Cela permettait de comprendre le fonctionnement de toutes les bases de la programmation (variables, conditions, boucles, framework). J’ai reproduit ce projet dans mon portfolio en l’étoffant un peu en permettant la personnalisation de la couleur, la possibilité de changer son message et l’ajout d’un mini-jeu Snake pour avoir un style rétro arcade qui correspond bien à ce projet. En conclusion, ce projet est important car il est la base de tous les suivants.</p>
                      </div>
                    )}

                    {/* SmartBot */}
                    {project?.id === "4197520e-c9ed-4d2c-8ac1-54db51c40327" && (
                      <div>
                        <p>
                          Cette section comporte deux projets en un car ils abordent le même thème. Le premier est le projet SmartBot, qui était le projet de fin de première année de mon BTS. C’est un projet qui a duré 4 mois pour environ 100 heures de travail et c’était aussi notre premier projet en groupe. Le but était de tout mettre en œuvre pour pouvoir contrôler un robot attaché à une Arduino avec l’aide d’un site web dont j’avais la tâche. Il y avait donc besoin de créer une API pour envoyer des requêtes AJAX permettant d’exécuter les codes de déplacements. Le robot était également équipé d’un capteur à ultrason lui permettant de détecter et esquiver des obstacles. J’ai reproduit en 3D sur mon portfolio ce projet afin de reproduire le mieux possible ce dont il était capable.
                          <br /><br />
                          Le second projet est une évolution du premier projet car maintenant on devait contrôler un bras robot en ayant les mêmes contraintes mais cette fois tout était hébergé sur un Raspberry Pi. Ce projet a duré 6 mois pour 200 heures de travail. En conclusion, ces deux projets ont été le point de départ des projets collaboratifs et le condensé de mes compétences acquises en BTS.
                          <br /><br />
                          Voici une vidéo d’illustration de mon projet :
                        </p>
                        <div className="video-container">
                          <iframe
                            src="https://www.youtube.com/embed/mXhjNqzCa4U"
                            title="Vidéo du projet SmartBot"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {/* Développement Mobile */}
                    {project?.id === "e317f069-708e-4c38-81bd-96dce6b36fde" && (
                      <div>
                        <p>Ce projet est une initiation au développement mobile Android et Java. Il a été réalisé en binôme en une vingtaine d’heures. Le but était de créer une application sur le thème du développement durable permettant de manipuler des données. Nous avons alors fait une application permettant de rentrer sa consommation énergétique et voir là où on se situe sur la moyenne française, ou on peut également se fixer des objectifs de consommation pour le prochain relevé. Ce projet a permis de mettre en pratique la programmation orientée objet et de me sortir du cadre du développement web.</p>
                      </div>
                    )}

                    {/* Projet Blog */}
                    {project?.id === "3763c6c8-c6d1-40cc-be5d-cca06771f0f9" && (
                      <div>
                        <p>Ce projet est une initiation à React et Next. Il a été réalisé en groupe en une trentaine d’heures. Le principe était de faire un site sur un thème au choix lié à une base de données Prisma. Les utilisateurs pouvaient se connecter, laisser des commentaires, jouer à des quiz. On avait également un système de rôles permettant d’éditer ou supprimer des données. Ce projet a apporté une nouvelle dimension dans mes projets futurs car je n’avais jamais utilisé de framework web, cela m’a donc permis d’étendre mes possibilités et mes compétences. </p>
                      </div>
                    )}

                    {/* Escape Game */}
                    {project?.id === "bdfee76e-6cc4-421d-b338-be2b55d175e4" && (
                      <div>
                        <p>
                          Ce projet est pour l’heure celui le plus avancé. C’était le projet de fin de semestre 5 en BUT MMI. Il a été réalisé sur l’espace de 4 mois en groupe de 5 et le concept était de concevoir entièrement un escape game jouable sur un navigateur, c’est-à-dire le scénario, les énigmes et le développement. La seule contrainte était de le développer pour un format téléphone et donc il devait pouvoir utiliser les capteurs de ce dernier (gyroscope, micro, caméra, accéléromètre…). 
                          <br /><br />
                          En conclusion, ce projet abordait à la fois le développement web et mobile et cela permettait de découvrir les interactions avec le téléphone. Voici notre projet ici (sans la base de données et les ressources) :{' '}
                          <a
                            href="https://escapegamesae501.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                          >
                            https://escapegamesae501.netlify.app/
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : null
        )
      ))}

      <div className="taskbar">
        <button className="start-button" onClick={() => setShowStartMenu(!showStartMenu)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Démarrer
        </button>

        {showStartMenu && (
          <div className="start-menu">
            <div className="start-menu-header">
              <span>{username}</span>
            </div>
            <div className="start-menu-content">
              <a href="https://github.com/pipetj" target="_blank" className="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                GitHub
              </a>
              <a href="https://fr.linkedin.com/in/jordan-pipet-438943251" target="_blank" className="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
              <button onClick={handleDownloadCV} className="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Télécharger CV
              </button>
              <button onClick={handleLogout} className="menu-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        )}

        {windows.map(window => (
          <div
            key={window.id}
            className={`taskbar-item ${window.minimized ? 'minimized' : 'active'}`}
            onClick={() => toggleMinimize(window.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                window.type === 'pyproject' ? "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" :
                  window.type === 'robotobject' ? "M16 18v-2a4 4 0 00-8 0v2m-4-6h16M6 8h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" :
                    window.type === 'background' ? "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" :
                      window.type === 'pinball' ? "M20 12H4m8-8v16M8 16l-4 4m12-4l4 4" :
                        "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              } />
            </svg>
            {window.type === 'pyproject' ? 'PyProject' :
              window.type === 'robotobject' ? 'RobotObject' :
                window.type === 'background' ? "Fond d'écran" :
                  window.type === 'pinball' ? 'Pinball' : 'Projets'}
          </div>
        ))}
        <div className="system-tray">
          <span>{currentTime}</span>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
      `}</style>

      <style jsx>{`
        .desktop-container {
          min-height: 100vh;
          background: ${backgroundImage ? 'none' : 'linear-gradient(to bottom right, #111827, #1e3a8a, #4f46e5)'};
          background-size: cover;
          background-position: center;
          overflow: hidden;
          position: relative;
          font-family: 'Segoe UI', sans-serif;
        }
        .background-effects {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .bg-circle {
          position: absolute;
          border-radius: 9999px;
        }
        .circle-1 {
          top: 25%;
          left: 25%;
          width: 24rem;
          height: 24rem;
          background: rgba(59,130,246,0.1);
          filter: blur(6rem);
        }
        .circle-2 {
          bottom: 33%;
          right: 33%;
          width: 16rem;
          height: 16rem;
          background: rgba(147,51,234,0.1);
          filter: blur(6rem);
        }
        .desktop-icons {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: flex-start;
        }
        .icon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 7rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .icon-container:hover {
          transform: scale(1.05);
        }
        .icon {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(to bottom right, #3b82f6, #4f46e5);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(59,130,246,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon svg {
          width: 3rem;
          height: 3rem;
          color: white;
        }
        .icon-label {
          margin-top: 0.75rem;
          padding: 0.25rem 1rem;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          color: white;
          font-size: 0.875rem;
          border-radius: 9999px;
        }
        .window {
          position: absolute;
          width: 800px;
          height: 600px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(6px);
          border-radius: 0.25rem;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          border: 1px solid #2d2d2d;
          overflow: hidden;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .window.maximized {
          width: 100%;
          height: calc(100vh - 3.5rem);
          top: 0;
          left: 0;
          border-radius: 0;
        }
        .detail-window {
          z-index: 11;
        }
        .project-link {
          color: #60a5fa;
          text-decoration: underline;
          transition: color 0.3s;
        }
        .project-link:hover {
          color: #2563eb;
        }
        .window-header {
          background: #e1e1e1;
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #a0a0a0;
          color: #000;
          cursor: move;
        }
        .window-header span {
          font-weight: 400;
          font-size: 0.875rem;
        }
        .window-controls {
          display: flex;
          gap: 0.25rem;
        }
        .control {
          width: 1.5rem;
          height: 1.5rem;
          background: #e1e1e1;
          border: 1px solid #a0a0a0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .control:hover {
          background: #d0d0d0;
        }
        .control svg {
          width: 1rem;
          height: 1rem;
          color: #000;
        }
        .close, .back {
          background: #c42b1c;
          border-color: #a02316;
        }
        .close:hover, .back:hover {
          background: #a02316;
        }
        .close svg, .back svg {
          color: white;
        }
        .window-content {
          padding: 1.5rem;
          height: calc(100% - 2.5rem);
          overflow-y: auto;
          color: #000;
          background: #f0f0f0;
        }
        .project-window {
          background: linear-gradient(135deg, #1e3a8a, #4f46e5);
          padding: 2rem;
          color: white;
        }
        .project-window h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .project-window p {
          font-size: 1rem;
          line-height: 1.5;
        }
        .project-title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
          text-align: center;
        }
        .video-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          margin-top: 1rem;
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.2);
        }
        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .project-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .project-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        .project-card-inner {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .project-card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #60a5fa;
          margin-bottom: 0.5rem;
        }
        .project-card-desc {
          font-size: 1rem;
          color: #e0e0e0;
          line-height: 1.5;
        }
        .project-card-date {
          font-size: 0.875rem;
          color: #bfdbfe;
          margin-top: 0.5rem;
        }
        .project-card-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(to right, #2563eb, #4f46e5);
          color: white;
          border-radius: 0.25rem;
          transition: background 0.3s;
          text-align: center;
        }
        .project-card-button:hover {
          background: linear-gradient(to right, #1d4ed8, #4338ca);
        }
        .no-projects {
          font-size: 1.25rem;
          color: #bfdbfe;
          text-align: center;
        }
        .taskbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5rem;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(6px);
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          padding: 0 1rem;
          z-index: 20;
        }
        .start-button {
          height: 2.5rem;
          padding: 0 1rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          background: linear-gradient(to right, #2563eb, #4f46e5);
          color: white;
          font-weight: 500;
          transition: background 0.3s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .start-button:hover {
          background: linear-gradient(to right, #1d4ed8, #4338ca);
        }
        .start-button svg {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }
        .taskbar-item {
          margin-left: 1rem;
          height: 2.5rem;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          color: white;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .taskbar-item.minimized {
          background: rgba(255,255,255,0.1);
        }
        .taskbar-item.active {
          background: rgba(59,130,246,0.5);
        }
        .taskbar-item svg {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }
        .system-tray {
          margin-left: auto;
          display: flex;
          align-items: center;
          color: white;
        }
        .system-tray span {
          font-size: 0.875rem;
        }
        .start-menu {
          position: absolute;
          bottom: 3.5rem;
          left: 0;
          width: 20rem;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .start-menu-header {
          background: linear-gradient(to right, #2563eb, #4f46e5);
          padding: 0.75rem 1rem;
          color: white;
          font-weight: 500;
        }
        .start-menu-content {
          padding: 0.5rem;
        }
        .menu-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          color: #000;
          text-decoration: none;
          border-radius: 0.25rem;
          transition: background 0.2s;
        }
        .menu-item:hover {
          background: rgba(0,0,0,0.1);
        }
        .menu-item svg {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.75rem;
          color: #000;
        }
        .logout {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .background-input {
          width: 100%;
          padding: 0.5rem;
          margin-top: 1rem;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 0.25rem;
          color: #000;
        }
        .validate-button {
          margin-top: 1rem;
          margin-right: 1rem;
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border-radius: 0.25rem;
          transition: background-color 0.3s;
        }
        .validate-button:hover {
          background: #1d4ed8;
        }
        .reset-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border-radius: 0.25rem;
          transition: background-color 0.3s;
        }
        .reset-button:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}