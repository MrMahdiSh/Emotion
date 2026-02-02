import React from 'react';
import { InsightResponse } from '../types';
import GlassCard from './GlassCard';
import { X, Sparkles, Lightbulb, TrendingUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: InsightResponse | null;
}

const AIInsightModal: React.FC<AIInsightModalProps> = ({ isOpen, onClose, isLoading, data }) => {
  const { t } = useApp();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl relative">
        <GlassCard className="max-h-[85vh] overflow-y-auto animate-fade-in bg-white/95 dark:bg-slate-900/90 border-primary/30 shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary flex items-center justify-center gap-2">
              <Sparkles className="text-secondary" />
              {t('aiModalTitle')}
            </h2>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-gray-400 animate-pulse">{t('analyzing')}</p>
             </div>
          ) : data ? (
            <div className="space-y-6 text-slate-700 dark:text-gray-200">
              <div className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-primary mb-2">{t('summaryTitle')}</h3>
                <p className="leading-relaxed">{data.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary mb-2 flex items-center gap-2">
                    <TrendingUp size={20} />
                    {t('patternsTitle')}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-gray-300 ml-2">
                    {data.patterns.map((pattern, idx) => (
                        <li key={idx}>{pattern}</li>
                    ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <Lightbulb size={20} className="text-yellow-500 dark:text-yellow-400" />
                    {t('adviceTitle')}
                </h3>
                <p className="italic text-slate-600 dark:text-gray-200">{data.advice}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 dark:text-red-400">{t('errorAnalysis')}</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default AIInsightModal;
