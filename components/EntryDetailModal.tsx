import React from 'react';
import { JournalEntry, EmotionLabels } from '../types';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { X, Pencil, Calendar, Clock, Activity } from 'lucide-react';

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onEdit?: (entry: JournalEntry) => void;
}

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose, onEdit }) => {
  const { t, language } = useApp();

  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg">
        <GlassCard className="relative animate-fade-in-up shadow-2xl border-primary/20">
           {/* Header */}
           <div className="flex items-start justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                 <h3 className="text-2xl font-bold text-textMain flex flex-wrap items-center gap-3">
                    {/* Emotion Label */}
                    {/* @ts-ignore */}
                    {EmotionLabels[language][entry.emotion]}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${entry.intensity >= 7 ? 'bg-energyLow/10 text-energyLow border-energyLow/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {t('intensityLabel')}: {entry.intensity}/10
                    </span>
                 </h3>
                 <div className="flex flex-wrap items-center gap-4 text-textMain/50 text-sm mt-2">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(entry.date).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bgMain text-textMain/50 hover:text-textMain transition-colors"
              >
                <X size={20} />
              </button>
           </div>

           {/* Content */}
           <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                  <h4 className="text-xs uppercase tracking-wider text-textMain/50 font-bold mb-2 flex items-center gap-2">
                    <Activity size={14} />
                    {t('triggerTitle')}
                  </h4>
                  <p className="text-textMain text-lg leading-relaxed bg-bgMain/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                    {entry.action}
                  </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {entry.reaction && (
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-textMain/50 font-bold mb-2">{t('reactionTitle')}</h4>
                        <p className="text-textMain leading-relaxed bg-bgMain/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            {entry.reaction}
                        </p>
                    </div>
                  )}
                  
                  {entry.result && (
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-textMain/50 font-bold mb-2">{t('resultTitle')}</h4>
                        <p className="text-textMain leading-relaxed bg-bgMain/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            {entry.result}
                        </p>
                    </div>
                  )}
              </div>
           </div>

           {/* Footer Actions */}
           <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={onClose}
                className="px-4 py-2 text-textMain/60 hover:text-textMain transition-colors text-sm font-medium"
              >
                {t('close')}
              </button>
              <button
                 onClick={() => {
                     if(onEdit) onEdit(entry);
                     onClose();
                 }}
                 className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-energyLow text-white rounded-xl shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
              >
                 <Pencil size={16} />
                 {t('clickToEdit')}
              </button>
           </div>

        </GlassCard>
      </div>
    </div>
  );
};
export default EntryDetailModal;