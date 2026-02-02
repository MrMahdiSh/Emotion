import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", title }) => {
  return (
    <div className={`
      bg-surface
      border border-slate-200 dark:border-white/5
      shadow-lg
      rounded-2xl p-6 
      transition-colors duration-300
      ${className}
    `}>
      {title && (
        <h3 className="text-xl font-bold text-textMain mb-4 border-b border-slate-200 dark:border-white/5 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default GlassCard;