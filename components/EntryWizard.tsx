import React, { useState, useEffect } from 'react';
import { EmotionType, JournalEntry, EmotionLabels } from '../types';
import { X, ArrowRight, ArrowLeft, Check, Meh, Smile, Frown, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { DateObject } from "react-multi-date-picker";

interface EntryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction: string;
  onSubmit: (entry: JournalEntry) => void;
  selectedDate?: any; // Can be Date, string, or DateObject
  editingEntry?: JournalEntry | null;
}

const EntryWizard: React.FC<EntryWizardProps> = ({ isOpen, onClose, initialAction, onSubmit, selectedDate, editingEntry }) => {
  const { t, language, dir } = useApp();
  const [step, setStep] = useState(1);
  
  const [action, setAction] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>(EmotionType.Neutral);
  const [intensity, setIntensity] = useState(5);
  const [reaction, setReaction] = useState('');
  const [result, setResult] = useState('');

  // Update fields when editingEntry changes or wizard opens
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setAction(editingEntry.action);
        setEmotion(editingEntry.emotion);
        setIntensity(editingEntry.intensity);
        setReaction(editingEntry.reaction);
        setResult(editingEntry.result);
      } else {
        // New Entry
        setAction(initialAction || '');
        setEmotion(EmotionType.Neutral);
        setIntensity(5);
        setReaction('');
        setResult('');
      }
      setStep(1);
    }
  }, [isOpen, editingEntry, initialAction]);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    let entryDateString: string;

    if (editingEntry) {
      // If editing, preserve the original date
      entryDateString = editingEntry.date;
    } else {
      // If new, calculate based on selectedDate
      let entryDate = new Date(); // Default to now

      if (selectedDate) {
        // If it's a react-date-object
        if (selectedDate instanceof DateObject) {
          entryDate = selectedDate.toDate();
        } 
        // If it's a string or standard Date
        else {
          entryDate = new Date(selectedDate);
        }

        // Preserve the current actual time (Hours/Minutes) but use the Year/Month/Day from selectedDate
        const now = new Date();
        entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      entryDateString = entryDate.toISOString();
    }

    const newEntry: JournalEntry = {
      id: editingEntry ? editingEntry.id : crypto.randomUUID(),
      date: entryDateString,
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

  // --- Intensity Helpers ---
  const getIntensityColor = (val: number) => {
    // Transition from calm blue/green (hue ~180/120) to intense red (hue 0)
    // Let's use 180 (Cyan) -> 0 (Red)
    const hue = 180 - ((val - 1) * (180 / 9)); 
    // Or if we prefer standard: 120 (Green) -> 0 (Red)
    const hueGreen = 120 - ((val - 1) * (120 / 9));
    return `hsl(${hueGreen}, 85%, 50%)`;
  };

  const getIntensityDescription = (val: number) => {
    if (val <= 2) return t('intensityVeryMild');
    if (val <= 4) return t('intensityMild');
    if (val <= 6) return t('intensityModerate');
    if (val <= 8) return t('intensityStrong');
    return t('intensityExtreme');
  };

  const inputClass = "w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-xl p-4 text-lg text-textMain placeholder-textMain/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner";
  const modalTitle = editingEntry ? t('editEntryTitle') : t('newEntryTitle');
  const submitText = editingEntry ? t('saveBtn') : t('submitBtn');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-bgMain/50">
           <span className="text-sm font-semibold text-textMain/60 uppercase tracking-wider">
             {modalTitle} - {t('step')} {step} / 4
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
                
                {/* Emotion Selection */}
                <div>
                  <label className="text-textMain/60 block mb-2">{t('emotionLabel')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(EmotionType).map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmotion(e)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${emotion === e ? 'bg-primary/10 border-primary text-primary scale-105 shadow-sm' : 'bg-bgMain border-transparent text-textMain/60 hover:bg-bgMain/80'}`}
                      >
                         <span className="mb-1">{getEmotionIcon(e)}</span>
                         <span className="text-xs font-medium">{EmotionLabels[language][e]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider - Immersive Design */}
                <div className="mt-8 bg-surface/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-textMain/60 font-medium">{t('intensityLabel')}</label>
                        <div 
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-bgMain border border-slate-200 dark:border-white/10 transition-all duration-300"
                            style={{ color: getIntensityColor(intensity) }}
                        >
                            <span className="text-sm font-bold">{getIntensityDescription(intensity)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center mb-8 relative py-4">
                        {/* Animated Background Pulse */}
                        <div 
                            className="absolute inset-0 rounded-full blur-2xl opacity-10 transition-all duration-300 mx-auto w-32 h-32"
                            style={{ 
                                backgroundColor: getIntensityColor(intensity),
                                transform: `scale(${0.8 + (intensity / 10)})`
                            }}
                        />
                        
                        {/* Big Number */}
                        <div 
                            className="text-7xl font-black transition-all duration-200 flex items-center gap-4 z-10 select-none"
                            style={{ 
                                color: getIntensityColor(intensity),
                                transform: `scale(${0.9 + (intensity / 25)})`,
                                textShadow: `0 0 ${intensity * 3}px ${getIntensityColor(intensity)}40`
                            }}
                        >
                            {intensity}
                        </div>
                    </div>

                    {/* Custom Slider */}
                    <div className="relative h-12 flex items-center group">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={intensity}
                            onChange={(e) => {
                                setIntensity(Number(e.target.value));
                                if (navigator.vibrate) navigator.vibrate(5); 
                            }}
                            className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none z-20 relative bg-bgMain"
                            style={{
                                background: `linear-gradient(to right, ${getIntensityColor(intensity)} 0%, ${getIntensityColor(intensity)} ${(intensity - 1) / 9 * 100}%, var(--color-bg) ${(intensity - 1) / 9 * 100}%, var(--color-bg) 100%)`,
                                direction: 'ltr' // Always LTR for slider gradient logic
                            }}
                        />
                        
                        {/* Injected Style for Thumb */}
                        <style>{`
                            input[type=range]::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                height: 24px;
                                width: 24px;
                                border-radius: 50%;
                                background: #ffffff;
                                border: 4px solid ${getIntensityColor(intensity)};
                                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                margin-top: -5px; /* Adjust based on h-3 (12px) vs thumb 24px */
                                transition: transform 0.1s;
                            }
                            input[type=range]::-webkit-slider-thumb:hover {
                                transform: scale(1.2);
                            }
                            input[type=range]::-moz-range-thumb {
                                height: 24px;
                                width: 24px;
                                border-radius: 50%;
                                background: #ffffff;
                                border: 4px solid ${getIntensityColor(intensity)};
                                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                transition: transform 0.1s;
                            }
                        `}</style>
                    </div>
                    
                    <div className="flex justify-between text-xs text-textMain/40 mt-1 px-1 font-medium" dir="ltr">
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
                  {submitText}
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