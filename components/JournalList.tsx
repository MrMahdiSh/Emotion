import React from 'react';
import { JournalEntry, EmotionType, EmotionLabels } from '../types';
import GlassCard from './GlassCard';
import { Trash2, PenLine, Smile, GitCommit, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface JournalListProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
}

const getEmotionColor = (emotion: EmotionType) => {
  switch (emotion) {
    case EmotionType.Angry: return 'text-red-500 dark:text-red-400 border-red-500/30 bg-red-500/10';
    case EmotionType.Happy: return 'text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/10';
    case EmotionType.Sad: return 'text-blue-500 dark:text-blue-400 border-blue-500/30 bg-blue-500/10';
    case EmotionType.Anxious: return 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10';
    default: return 'text-purple-500 dark:text-purple-400 border-purple-500/30 bg-purple-500/10';
  }
};

const JournalList: React.FC<JournalListProps> = ({ entries, onDelete }) => {
  const { t, language, dir } = useApp();
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedEntries.length === 0) {
    const steps = [
      { icon: <PenLine size={24} />, title: t('guideStep1Title'), desc: t('guideStep1Desc'), color: "text-blue-400 bg-blue-500/10" },
      { icon: <Smile size={24} />, title: t('guideStep2Title'), desc: t('guideStep2Desc'), color: "text-green-400 bg-green-500/10" },
      { icon: <GitCommit size={24} className="rotate-90" />, title: t('guideStep3Title'), desc: t('guideStep3Desc'), color: "text-amber-400 bg-amber-500/10" },
      { icon: <Sparkles size={24} />, title: t('guideStep4Title'), desc: t('guideStep4Desc'), color: "text-purple-400 bg-purple-500/10" },
    ];

    return (
      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        <h3 className="text-2xl font-bold text-textMain mb-8 opacity-80">{t('guideTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {steps.map((step, index) => (
            <div key={index} className="bg-surface border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.02] hover:bg-white/50 dark:hover:bg-white/5 shadow-sm">
               <div className={`p-3 rounded-xl ${step.color}`}>
                 {step.icon}
               </div>
               <div>
                 <h4 className="font-bold text-textMain mb-1">{step.title}</h4>
                 <p className="text-sm text-textMain/60 leading-relaxed">{step.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <GlassCard key={entry.id} className="relative group transition-all hover:bg-white/90 dark:hover:bg-white/10">
          <button 
            onClick={() => onDelete(entry.id)}
            className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity`}
            title={t('delete')}
          >
            <Trash2 size={18} />
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-3 border-b border-slate-200 dark:border-glassBorder pb-3">
            <div className={`px-3 py-1 rounded-full text-sm font-bold border w-fit flex items-center gap-2 ${getEmotionColor(entry.emotion)}`}>
               <span>{EmotionLabels[language][entry.emotion]}</span>
               <span className="text-xs opacity-70">| {entry.intensity}/10</span>
            </div>
            <div className="text-slate-500 dark:text-gray-400 text-sm flex items-center">
                {new Date(entry.date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-1">{t('triggerTitle')}</p>
                <p className="text-slate-800 dark:text-gray-200">{entry.action}</p>
            </div>
            <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-1">{t('reactionTitle')}</p>
                <p className="text-slate-800 dark:text-gray-200">{entry.reaction}</p>
            </div>
             <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-1">{t('resultTitle')}</p>
                <p className="text-slate-800 dark:text-gray-200">{entry.result}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default JournalList;