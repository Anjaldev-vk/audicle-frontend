import React from 'react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      {/* Abstract Animated Glows */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Brand Icon/Logo Frame */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
           <div className="absolute inset-0 rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
           
           {/* Simple custom wave animation icon */}
           <div className="flex items-center justify-center gap-1.5 z-10">
             <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-[bounce_1s_infinite]"></div>
             <div className="w-1.5 h-10 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
             <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
           </div>
           
           {/* Expanding pulse rings */}
           <div className="absolute inset-0 border border-indigo-500/30 rounded-3xl animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </div>

        {/* Brand Text */}
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 mb-3">
          Audicle
        </h1>
        
        {/* Loading Indicator */}
        <div className="text-[0.65rem] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2 mt-4">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
           Initializing Systems...
        </div>
      </div>
    </div>
  );
}