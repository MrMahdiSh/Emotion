import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before finish
    const exitTimer = setTimeout(() => setIsExiting(true), 3500);
    const finishTimer = setTimeout(onFinish, 4200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F111A] overflow-hidden transition-all duration-700 ease-in-out font-sans ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#6366F1]/20 blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#F43F5E]/20 blur-[150px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

        {/* Central Logo Container */}
        <div className="relative mb-8">
            {/* Pulsing ring */}
            <div className="absolute inset-0 bg-[#6366F1]/30 blur-xl rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            
            {/* Icon Card */}
            <div className="relative z-10 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-[fadeInUp_1.2s_cubic-bezier(0.16,1,0.3,1)]">
                <BrainCircuit size={96} className="text-[#818CF8] drop-shadow-[0_0_15px_rgba(129,140,248,0.8)] rotate-90" />
            </div>
        </div>

        {/* Typography */}
        <div className="text-center z-10 relative">
            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-white to-[#FB7185] animate-[fadeIn_1.5s_ease-out] drop-shadow-lg">
                Maral
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent mt-4 mb-4 rounded-full" />
            <p className="text-lg text-slate-400 font-light tracking-[0.4em] uppercase opacity-0 animate-[slideUp_1s_ease-out_0.6s_forwards]">
                Your Mood Mentor
            </p>
        </div>

        {/* Loading Indicator */}
        <div className="absolute bottom-16 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#818CF8] to-transparent w-[50%] animate-[shimmer_2s_infinite_linear]" />
        </div>

        <style>{`
            @keyframes shimmer {
                0% { transform: translateX(-150%); }
                100% { transform: translateX(150%); }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; filter: blur(5px); }
                to { transform: translateY(0); opacity: 1; filter: blur(0); }
            }
            @keyframes fadeInUp {
                from { transform: translateY(40px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `}</style>
    </div>
  );
};

export default SplashScreen;