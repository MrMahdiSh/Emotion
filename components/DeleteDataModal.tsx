import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (range: '7d' | '30d' | 'all' | 'custom', start?: string, end?: string) => void;
}

const DeleteDataModal: React.FC<DeleteDataModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useApp();
  const [rangeType, setRangeType] = useState<'7d' | '30d' | 'all' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!isOpen) return null;

  const handleDelete = () => {
    onConfirm(rangeType, customStart, customEnd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <GlassCard className="relative animate-fade-in-up border-red-500/30">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-textMain/40 hover:text-textMain transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2 text-energyLow">
            <Trash2 size={28} />
            <h3 className="text-xl font-bold text-textMain">{t('deleteTitle')}</h3>
          </div>
          <div className="flex gap-2 items-start p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-6">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-textMain/80 text-xs leading-relaxed">{t('deleteDesc')}</p>
          </div>

          <div className="space-y-3 mb-8">
            <button 
                onClick={() => setRangeType('7d')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === '7d' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeLast7')}</span>
                {rangeType === '7d' && <div className="w-3 h-3 rounded-full bg-red-500" />}
            </button>
            
            <button 
                onClick={() => setRangeType('30d')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === '30d' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeLast30')}</span>
                {rangeType === '30d' && <div className="w-3 h-3 rounded-full bg-red-500" />}
            </button>

            <button 
                onClick={() => setRangeType('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === 'all' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeAllTime')}</span>
                {rangeType === 'all' && <div className="w-3 h-3 rounded-full bg-red-500" />}
            </button>

            <button 
                onClick={() => setRangeType('custom')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${rangeType === 'custom' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-bgMain border-transparent text-textMain/70 hover:bg-bgMain/80'}`}
            >
                <span className="font-medium">{t('rangeCustom')}</span>
                {rangeType === 'custom' && <div className="w-3 h-3 rounded-full bg-red-500" />}
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
            onClick={handleDelete}
            disabled={rangeType === 'custom' && (!customStart || !customEnd)}
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={20} />
            {t('confirmDeleteBtn')}
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default DeleteDataModal;