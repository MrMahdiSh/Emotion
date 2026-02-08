import React from 'react';
import { UserProfile } from '../types';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { X, User, Trash2, Check, LogIn, Plus } from 'lucide-react';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
}

const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({ 
    isOpen, 
    onClose, 
    profiles, 
    currentProfile, 
    onSwitch, 
    onDelete,
    onImport
}) => {
  const { t, language } = useApp();

  if (!isOpen) return null;

  const handleDeleteClick = (profile: UserProfile) => {
      const confirmMsg = t('confirmDeleteProfileDesc').replace('{name}', profile.name);
      if (window.confirm(confirmMsg)) {
          onDelete(profile.id);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <GlassCard className="relative animate-fade-in-up">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-textMain/40 hover:text-textMain transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
              <User size={24} className="text-primary" />
              {t('profileManagerTitle')}
          </h3>

          <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {profiles.map(profile => {
                const isCurrent = currentProfile?.id === profile.id;
                return (
                    <div 
                        key={profile.id} 
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrent ? 'bg-primary/10 border-primary shadow-sm' : 'bg-bgMain border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-full ${isCurrent ? 'bg-primary text-white' : 'bg-surface text-textMain/40'}`}>
                                <User size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className={`font-bold truncate ${isCurrent ? 'text-primary' : 'text-textMain'}`}>{profile.name}</span>
                                {isCurrent && <span className="text-[10px] text-primary/70 uppercase tracking-wider">{t('current')}</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             {!isCurrent && (
                                 <button 
                                    onClick={() => onSwitch(profile.id)}
                                    className="p-2 rounded-lg bg-surface hover:bg-primary hover:text-white text-textMain/60 transition-colors shadow-sm"
                                    title={t('switchTo')}
                                 >
                                     <LogIn size={18} className={language === 'fa' ? 'rotate-180' : ''} />
                                 </button>
                             )}
                             <button 
                                onClick={() => handleDeleteClick(profile)}
                                className="p-2 rounded-lg bg-surface hover:bg-red-500 hover:text-white text-textMain/40 transition-colors shadow-sm group"
                                title={t('deleteProfile')}
                             >
                                 <Trash2 size={18} />
                             </button>
                        </div>
                    </div>
                );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/5">
             <button 
                onClick={onImport}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 text-textMain/60 hover:text-primary hover:border-primary transition-all hover:bg-primary/5 font-medium"
             >
                 <Plus size={20} />
                 {t('importBtn')}
             </button>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

export default ProfileManagerModal;