"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [stage, setStage] = useState("boot");
  const [loading, setLoading] = useState(false);
  const [windows, setWindows] = useState([]);
  const [projects, setProjects] = useState([]);
  const username = "Pipet Jordan";

  // Boot sequence
  useEffect(() => {
    setTimeout(() => {
      setStage("login");
    }, 3000);
  }, []);

  // Fetch projects when desktop loads
  useEffect(() => {
    if (stage === "desktop") {
      console.log("Fetching projects from /portfolio...");
      fetch('https://portfolio-spring-boot-backend.onrender.com/portfolio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          console.log("Response received:", res);
          return res.text(); // Utilisez .text() car .json() ne fonctionne pas avec no-cors
        })
        .then(data => {
          console.log("Raw data:", data);
          // Essayez de parser manuellement si possible, mais avec no-cors, les données peuvent être limitées
          setProjects(data ? JSON.parse(data) : []);
        })
        .catch(err => {
          console.error("Error fetching projects:", err);
          setProjects([]);
        });
    }
  }, [stage]);

  // Login handler
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setStage("loginAnimation");
      setTimeout(() => {
        setStage("desktop");
      }, 2000);
    }, 800);
  };

  // Window management
  const openWindow = (type) => {
    setWindows(prev => [...prev, { id: Date.now(), type, minimized: false }]);
  };

  const closeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const toggleMinimize = (id) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, minimized: !w.minimized } : w
    ));
  };

  // Boot Screen
  if (stage === "boot") {
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
          <p className="boot-text">Initializing Portfolio Experience...</p>
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
            animation: progress 3s infinite;
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
            50% { width: 100%; }
            100% { width: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Login Screen
  if (stage === "login") {
    return (
      <div className="login-container">
        <div className="background-effects">
          <div className="float-circle circle-1"></div>
          <div className="float-circle circle-2"></div>
        </div>
        <div className="login-card">
          <div className="card-header">
            <span>Sign in to Portfolio</span>
          </div>
          <div className="card-content">
            <div className="avatar-container">
              <div className="avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
              </div>
            </div>
            <div className="user-info">
              <h2>{username}</h2>
              <p>Developer Portfolio</p>
            </div>
            <div className="password-field">
              <div className="cursor"></div>
            </div>
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="sign-in-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="hint-text">
              <p>Press Enter to sign in to your portfolio</p>
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
          .password-field {
            width: 100%;
            height: 2.5rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 0.5rem;
            padding: 0 0.75rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
          }
          .cursor {
            width: 0.5rem;
            height: 1rem;
            background: white;
            animation: blink 1s infinite;
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
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Login Animation
  if (stage === "loginAnimation") {
    return (
      <div className="login-animation-container">
        <div className="animation-content">
          <div className="welcome-message">
            <h1>Welcome, {username}</h1>
            <p>Preparing your portfolio environment</p>
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

  // Desktop
  return (
    <div className="desktop-container">
      <div className="background-effects">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
      </div>

      <div className="desktop-icons">
        <div 
          className="icon-container"
          onClick={() => openWindow('projects')}
        >
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="icon-label">Projects</span>
        </div>
      </div>

      {windows.map(window => (
        !window.minimized && (
          window.type === 'projects' ? (
            <div 
              key={window.id}
              className="window"
            >
              <div className="window-header">
                <span>Projects - Pipet Jordan</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <button onClick={() => closeWindow(window.id)} className="control close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="window-content wiki-style">
                <h1>Projects</h1>
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <div key={index} className="project-entry">
                      <h2>{project.title || "No title"}</h2>
                      <p>{project.description || "No description"}</p>
                      <button 
                        onClick={() => openWindow(`project-${project.id || index}`)}
                        className="details-button"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No projects available</p>
                )}
              </div>
            </div>
          ) : (
            <div 
              key={window.id}
              className="window detail-window"
            >
              <div className="window-header">
                <span>Project Details</span>
                <div className="window-controls">
                  <button onClick={() => toggleMinimize(window.id)} className="control minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
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
                {/* Contenu vierge pour personnalisation future */}
              </div>
            </div>
          )
        )
      ))}

      <div className="taskbar">
        <button className="start-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Start
        </button>
        {windows.map(window => (
          <div 
            key={window.id}
            className={`taskbar-item ${window.minimized ? 'minimized' : 'active'}`}
            onClick={() => toggleMinimize(window.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {window.type.startsWith('project-') ? 'Project Details' : 'Projects'}
          </div>
        ))}
        <div className="system-tray">
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      <style jsx>{`
        .desktop-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #111827, #1e3a8a, #4f46e5);
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
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1.5rem;
        }
        .icon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 6rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .icon-container:hover {
          transform: scale(1.05);
        }
        .icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(to bottom right, #3b82f6, #4f46e5);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(59,130,246,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon svg {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
        }
        .icon-label {
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          color: white;
          font-size: 0.75rem;
          border-radius: 9999px;
        }
        .window {
          position: absolute;
          width: 80%;
          max-width: 64rem;
          min-height: 400px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(6px);
          border-radius: 0.25rem; /* Plus carré pour style Windows */
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          border: 1px solid #2d2d2d;
          overflow: hidden;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        .detail-window {
          background: white;
          border: 1px solid #2d2d2d;
        }
        .window-header {
          background: #e1e1e1; /* Gris clair style Windows */
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #a0a0a0;
          color: #000;
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
        .close {
          background: #c42b1c;
          border-color: #a02316;
        }
        .close:hover {
          background: #a02316;
        }
        .close svg {
          color: white;
        }
        .window-content {
          padding: 1.5rem;
          height: calc(400px - 2.5rem);
        }
        .wiki-style {
          background: linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.25rem;
          padding: 1.25rem;
        }
        .wiki-style h1 {
          font-size: 1.5rem;
          color: white;
          font-weight: 700;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 0.5rem;
        }
        .project-entry {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .project-entry:last-child {
          border-bottom: none;
        }
        .project-entry h2 {
          font-size: 1.25rem;
          color: #60a5fa;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .project-entry p {
          color: rgba(255,255,255,0.9);
          margin-bottom: 0.75rem;
        }
        .details-button {
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border-radius: 0.25rem;
          transition: background-color 0.3s;
        }
        .details-button:hover {
          background: #1d4ed8;
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
      `}</style>
    </div>
  );
}