import React, { useState } from 'react';
import { UserProfile } from '../types';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { User } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { t, dir } = useApp();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      created: new Date().toISOString()
    };
    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md">
        <GlassCard className="text-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-energyHigh" />
          
          <div className="flex justify-center mb-6 mt-4">
             <div className="p-4 bg-primary/10 rounded-full text-primary ring-4 ring-primary/5">
                <User size={48} />
             </div>
          </div>

          <h2 className="text-2xl font-bold text-textMain mb-2">{t('onboardingTitle')}</h2>
          <p className="text-textMain/60 mb-8">{t('onboardingDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className={`w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg text-textMain placeholder-textMain/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center shadow-inner`}
              autoFocus
            />

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-energyHigh text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('continueBtn')}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default OnboardingModal;