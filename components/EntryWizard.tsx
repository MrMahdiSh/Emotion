import React, { useState, useEffect } from 'react';
import { EmotionType, JournalEntry, EmotionLabels } from '../types';
import { X, ArrowRight, ArrowLeft, Check, Meh, Smile, Frown, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface EntryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction: string;
  onSubmit: (entry: JournalEntry) => void;
}

const EntryWizard: React.FC<EntryWizardProps> = ({ isOpen, onClose, initialAction, onSubmit }) => {
  const { t, language, dir } = useApp();
  const [step, setStep] = useState(1);
  
  const [action, setAction] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>(EmotionType.Neutral);
  const [intensity, setIntensity] = useState(5);
  const [reaction, setReaction] = useState('');
  const [result, setResult] = useState('');

  // Update action if initialAction changes
  useEffect(() => {
    if (initialAction) setAction(initialAction);
  }, [initialAction, isOpen]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAction('');
      setEmotion(EmotionType.Neutral);
      setIntensity(5);
      setReaction('');
      setResult('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      action,
      emotion,
      reaction,
      result,
      intensity,
    };
    onSubmit(newEntry);
    onClose();
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleFinalSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getEmotionIcon = (type: EmotionType) => {
    // Simple mapping for visuals
    switch(type) {
      case EmotionType.Happy:
      case EmotionType.Excited: return <Smile size={24} />;
      case EmotionType.Sad: return <Frown size={24} />;
      case EmotionType.Angry: 
      case EmotionType.Frustrated: return <Zap size={24} />;
      default: return <Meh size={24} />;
    }
  };

  const inputClass = "w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-xl p-4 text-lg text-textMain placeholder-textMain/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-bgMain/50">
           <span className="text-sm font-semibold text-textMain/60 uppercase tracking-wider">
             {t('newEntryTitle')} - {t('step')} {step} / 4
           </span>
           <button onClick={onClose} className="text-textMain/40 hover:text-energyLow transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-bgMain">
          <div 
            className="h-full bg-gradient-to-r from-primary to-energyHigh transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
           {step === 1 && (
             <div className="space-y-4 animate-fade-in">
                <h3 className="text-2xl font-bold text-textMain">{t('step1Title')}</h3>
                <label className="text-textMain/60 block">{t('triggerLabel')}</label>
                <textarea 
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder={t('triggerPlaceholder')}
                  className={inputClass}
                  rows={4}
                  autoFocus
                />
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-textMain">{t('step2Title')}</h3>
                
                <div>
                  <label className="text-textMain/60 block mb-2">{t('emotionLabel')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(EmotionType).map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmotion(e)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${emotion === e ? 'bg-primary/10 border-primary text-primary' : 'bg-bgMain border-transparent text-textMain/60 hover:bg-bgMain/80'}`}
                      >
                         <span className="mb-1">{getEmotionIcon(e)}</span>
                         <span className="text-xs font-medium">{EmotionLabels[language][e]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="text-textMain/60 block mb-2 flex justify-between">
                     <span>{t('intensityLabel')}</span>
                     <span className="font-bold text-primary">{intensity}</span>
                   </label>
                   <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-bgMain rounded-lg appearance-none cursor-pointer accent-primary"
                      style={{ direction: 'ltr' }}
                    />
                    <div className="flex justify-between text-xs text-textMain/40 mt-1 px-1" dir="ltr">
                      <span>1</span>
                      <span>10</span>
                    </div>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-4 animate-fade-in">
                <h3 className="text-2xl font-bold text-textMain">{t('step3Title')}</h3>
                <label className="text-textMain/60 block">{t('reactionLabel')}</label>
                <textarea 
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value)}
                  placeholder={t('reactionPlaceholder')}
                  className={inputClass}
                  rows={4}
                  autoFocus
                />
             </div>
           )}

           {step === 4 && (
             <div className="space-y-4 animate-fade-in">
                <h3 className="text-2xl font-bold text-textMain">{t('step4Title')}</h3>
                <label className="text-textMain/60 block">{t('resultLabel')}</label>
                <textarea 
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder={t('resultPlaceholder')}
                  className={inputClass}
                  rows={4}
                  autoFocus
                />
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-bgMain/30 flex justify-between">
           {step > 1 ? (
             <button 
               onClick={prevStep}
               className="flex items-center gap-2 px-4 py-2 text-textMain/60 hover:text-textMain transition-colors"
             >
               {dir === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
               {t('prev')}
             </button>
           ) : (
             <button 
               onClick={onClose}
               className="px-4 py-2 text-textMain/60 hover:text-energyLow transition-colors"
             >
               {t('cancel')}
             </button>
           )}

           <button 
             onClick={nextStep}
             disabled={step === 1 && !action.trim()}
             className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg
               ${step === 4 
                 ? 'bg-gradient-to-r from-energyHigh to-green-500 hover:from-green-400 hover:to-green-600' 
                 : 'bg-gradient-to-r from-primary to-energyLow hover:from-primary/90 hover:to-energyLow/90'}
               ${step === 1 && !action.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
             `}
           >
             {step === 4 ? (
                <>
                  <Check size={18} />
                  {t('submitBtn')}
                </>
             ) : (
                <>
                  {t('next')}
                  {dir === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
};

export default EntryWizard;