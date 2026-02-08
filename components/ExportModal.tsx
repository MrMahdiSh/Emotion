import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { X, Calendar, Download, FileJson } from 'lucide-react';
import { subDays, isAfter } from 'date-fns';
import { JournalEntry, ExportPackage, UserProfile } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  user: UserProfile;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, entries, user }) => {
  const { t, language } = useApp();
  const [rangeType, setRangeType] = useState<'7d' | '30d' | 'all' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    let filteredEntries = [...entries];
    const now = new Date();

    if (rangeType === '7d') {
      const cutoff = subDays(now, 7);
      filteredEntries = entries.filter(e => isAfter(new Date(e.date), cutoff));
    } else if (rangeType === '30d') {
      const cutoff = subDays(now, 30);
      filteredEntries = entries.filter(e => isAfter(new Date(e.date), cutoff));
    } else if (rangeType === 'custom' && customStart && customEnd) {
      const start = new Date(customStart); start.setHours(0,0,0,0);
      const end = new Date(customEnd); end.setHours(23,59,59,999);
      filteredEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }

    const exportData: ExportPackage = {
      user: user,
      entries: filteredEntries,
      exportedAt: new Date().toISOString(),
      appVersion: "1.0.0"
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    // Filename: MoodMorph_UserName_Date
    const safeName = user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `MoodMorph_${safeName}_${new Date().toISOString().split('T')[0]}`;
    
    try {
        // @ts-ignore
        if (typeof window.DotNet !== 'undefined') {
             // MAUI / Blazor Hybrid Context
             // @ts-ignore
             const result = await window.DotNet.invokeMethodAsync(
                'EmotionTracker',
                'ExportDataAsFile',
                dataStr,
                fileName
            );
            alert(result);
        } else {
            // Browser Fallback
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (e: any) {
        alert("Export failed: " + e.message);
    }
    
    onClose();
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

          <div className="flex items-center gap-3 mb-2 text-primary">
            <FileJson size={28} />
            <h3 className="text-xl font-bold text-textMain">{t('exportTitle')}</h3>
          </div>
          <p className="text-textMain/60 mb-6 text-sm">{t('exportDesc')}</p>

          <div className="space-y-3 mb-8">
            <button 
                onClick={() => setRangeType('7d')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === '7d' ? 'bg-primary/10 border-primary text-primary' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeLast7')}</span>
                {rangeType === '7d' && <div className="w-3 h-3 rounded-full bg-primary" />}
            </button>
            
            <button 
                onClick={() => setRangeType('30d')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === '30d' ? 'bg-primary/10 border-primary text-primary' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeLast30')}</span>
                {rangeType === '30d' && <div className="w-3 h-3 rounded-full bg-primary" />}
            </button>

            <button 
                onClick={() => setRangeType('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeAllTime')}</span>
                {rangeType === 'all' && <div className="w-3 h-3 rounded-full bg-primary" />}
            </button>

            <button 
                onClick={() => setRangeType('custom')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === 'custom' ? 'bg-primary/10 border-primary text-primary' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeCustom')}</span>
                {rangeType === 'custom' && <div className="w-3 h-3 rounded-full bg-primary" />}
            </button>

            {rangeType === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-2 animate-fade-in">
                    <div>
                        <label className="text-xs text-textMain/50 block mb-1">{t('startDate')}</label>
                        <input 
                            type="date" 
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-textMain"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-textMain/50 block mb-1">{t('endDate')}</label>
                        <input 
                            type="date" 
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-textMain"
                        />
                    </div>
                </div>
            )}
          </div>

          <button 
            onClick={handleExport}
            disabled={rangeType === 'custom' && (!customStart || !customEnd)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-energyHigh text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {t('downloadBtn')}
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default ExportModal;