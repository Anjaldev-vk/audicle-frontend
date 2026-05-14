import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-brand-bg overflow-hidden font-sans transition-colors duration-700">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Premium Logo Animation Frame */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-brand-primary/30 transition-all duration-1000 animate-pulse"></div>
          
          <div className="relative w-28 h-28 flex items-center justify-center rounded-[2.5rem] bg-brand-surface border border-brand-border shadow-2xl backdrop-blur-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-50"></div>
            
            {/* Visual Equalizer / Sound Wave Animation */}
            <div className="flex items-end justify-center gap-1.5 h-12 z-10">
              {[0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.1].map((delay, i) => (
                <div 
                  key={i}
                  className="w-1.5 bg-brand-primary rounded-full animate-[wave_1.2s_ease-in-out_infinite]"
                  style={{ 
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${delay}s` 
                  }}
                ></div>
              ))}
            </div>

            {/* Shine effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-[shine_3s_infinite]"></div>
          </div>

          {/* Decorative Rings */}
          <div className="absolute -inset-4 border border-brand-primary/10 rounded-[3rem] animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute -inset-8 border border-brand-primary/5 rounded-[3.5rem] animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-text-main animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Audicle
          </h1>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-80 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
            Intelligence
          </p>
        </div>
        
        {/* Progress System */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-48 h-1 bg-brand-highlight rounded-full overflow-hidden border border-brand-border">
            <div className="h-full bg-brand-primary rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 text-brand-primary animate-pulse" />
            Synchronizing Neural Nodes
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}