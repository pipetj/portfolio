"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [stage, setStage] = useState("boot"); // "boot", "login", "loginAnimation", "desktop"
  const [loading, setLoading] = useState(false);
  const username = "Pipet Jordan";
  
  // Handle initial boot sequence
  useEffect(() => {
    // Start with boot animation
    setTimeout(() => {
      // Move to login screen after boot animation completes
      setStage("login");
    }, 3000);
  }, []);

  // Handle login process
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setStage("loginAnimation");
      setTimeout(() => {
        setStage("desktop");
      }, 2000); // Transition to desktop after login animation
    }, 800);
  };

  // Modern Boot Animation
  if (stage === "boot") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Modern Windows-inspired loading animation */}
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            {/* Modern Windows logo animation */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-14 h-14 bg-[#f25022] rounded-sm animate-pulse"></div>
                  <div className="w-14 h-14 bg-[#7fba00] rounded-sm animate-pulse" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-14 h-14 bg-[#00a4ef] rounded-sm animate-pulse" style={{animationDelay: "0.4s"}}></div>
                  <div className="w-14 h-14 bg-[#ffb900] rounded-sm animate-pulse" style={{animationDelay: "0.6s"}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern loader */}
          <div className="w-64 h-1 mx-auto bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-modernProgress w-full"></div>
          </div>
          
          <p className="mt-6 text-white text-sm font-light">Initializing Portfolio Experience...</p>
        </div>
      </div>
    );
  }

  // Modern Login Screen
  if (stage === "login") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden" 
        style={{ 
          backgroundImage: 'url("/api/placeholder/1920/1080")',
          fontFamily: 'Segoe UI, sans-serif' 
        }}
      >
        {/* Modern blur glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-sm"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: "1s"}}></div>
        </div>
        
        {/* Modern Windows login card */}
        <div className="relative z-10 w-96 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center">
            <span className="text-white font-medium text-lg">Sign in to Portfolio</span>
          </div>
          
          <div className="p-8">
            {/* User avatar */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-white rounded-full p-2 flex items-center justify-center overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5" className="w-16 h-16">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Username and password */}
            <div className="text-center mb-8">
              <h2 className="text-white text-xl font-bold">{username}</h2>
              <p className="text-blue-100 text-sm mt-1">Developer Portfolio</p>
            </div>
            
            {/* Password field with modern styling */}
            <div className="mb-6">
              <div className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 shadow-inner flex items-center">
                <div className="w-full h-4 flex items-center">
                  <div className="w-2 h-4 bg-white animate-blink"></div>
                </div>
              </div>
            </div>
            
            {/* Modern Sign in button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  px-8 py-2 
                  rounded-lg
                  font-medium
                  text-white
                  shadow-lg shadow-blue-500/30
                  transition-all duration-300
                  hover:shadow-blue-500/50 hover:translate-y-[-2px]
                  active:shadow-inner active:translate-y-[0px]
                  ${loading ? 'opacity-70 cursor-wait' : ''}
                `}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
            
            {/* Hint text at bottom */}
            <div className="mt-6 text-center text-xs text-blue-100/80">
              <p>Press Enter to sign in to your portfolio</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login transition animation
  if (stage === "loginAnimation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center">
          {/* Welcome message animation */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white animate-fadeIn">Welcome, {username}</h1>
            <p className="text-blue-200 mt-2 animate-fadeIn" style={{animationDelay: "0.3s"}}>Preparing your portfolio environment</p>
          </div>
          
          {/* Modern circular loader */}
          <div className="w-16 h-16 mx-auto relative animate-spin">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Modern Portfolio Desktop
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 bg-cover bg-center overflow-hidden relative" 
         style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Desktop background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Desktop Icons with modern styling */}
      <div className="p-6 grid grid-cols-1 gap-6">
        {/* Projects Icon */}
        <div className="flex flex-col items-center w-24 group cursor-pointer hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="mt-2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">Projects</span>
        </div>
        
        {/* Skills Icon */}
        <div className="flex flex-col items-center w-24 group cursor-pointer hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="mt-2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">Skills</span>
        </div>
        
        {/* Contact Icon */}
        <div className="flex flex-col items-center w-24 group cursor-pointer hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="mt-2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">Contact</span>
        </div>
      </div>

      {/* Main Portfolio Window */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-4xl min-h-[400px] bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Modern window title bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-white font-medium">Portfolio - Pipet Jordan | Web Developer</span>
          </div>
          <div className="flex space-x-2">
            <button className="w-3 h-3 rounded-full bg-amber-400"></button>
            <button className="w-3 h-3 rounded-full bg-green-400"></button>
            <button className="w-3 h-3 rounded-full bg-red-400"></button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-4 pt-4 flex border-b border-white/10">
          <div className="px-4 py-2 bg-white/10 text-white font-medium rounded-t-lg border-b-2 border-blue-500">Overview</div>
          <div className="px-4 py-2 text-blue-200 hover:text-white transition-colors">Projects</div>
          <div className="px-4 py-2 text-blue-200 hover:text-white transition-colors">Skills</div>
          <div className="px-4 py-2 text-blue-200 hover:text-white transition-colors">Contact</div>
        </div>
        
        {/* Content with modern styling */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg">
            <h2 className="text-blue-400 text-xl font-bold mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About Me
            </h2>
            <p className="text-white/90 leading-relaxed">
              Passionate web developer creating modern applications with cutting-edge technologies.
              I blend aesthetics and functionality to deliver exceptional user experiences with every project.
            </p>
            <div className="mt-4 flex space-x-3">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                Resume
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                LinkedIn
              </button>
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg">
            <h2 className="text-blue-400 text-xl font-bold mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Skills
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-white/90 text-sm mb-1">JavaScript</span>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-4/5"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm mb-1">React.js</span>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-11/12"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm mb-1">Node.js</span>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-3/4"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm mb-1">TailwindCSS</span>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Projects Section */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-lg">
            <h2 className="text-blue-400 text-xl font-bold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 rounded-lg p-4 transition-transform hover:scale-105 cursor-pointer">
                <div className="h-32 mb-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">E-Commerce Platform</h3>
                <p className="text-blue-100 text-sm">Complete shop with cart and secure checkout system</p>
                <div className="flex mt-3 space-x-2">
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">React</span>
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">Node.js</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 rounded-lg p-4 transition-transform hover:scale-105 cursor-pointer">
                <div className="h-32 mb-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">Analytics Dashboard</h3>
                <p className="text-blue-100 text-sm">Real-time data visualization for business metrics</p>
                <div className="flex mt-3 space-x-2">
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">Next.js</span>
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">D3.js</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 rounded-lg p-4 transition-transform hover:scale-105 cursor-pointer">
                <div className="h-32 mb-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-1">Task Manager App</h3>
                <p className="text-blue-100 text-sm">Mobile application for task management</p>
                <div className="flex mt-3 space-x-2">
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">React Native</span>
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full">Firebase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-black/20 backdrop-blur-md border-t border-white/10 flex items-center px-4 z-20">
        {/* Start button */}
        <button className="h-10 px-4 rounded-lg flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Start
        </button>
        
        {/* Open apps */}
        <div className="ml-4 h-10 px-4 bg-white/10 border border-white/20 rounded-lg flex items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Portfolio
        </div>
        
        {/* Time and system tray */}
        <div className="ml-auto flex items-center text-white">
          <span className="text-sm">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </div>
  );
}