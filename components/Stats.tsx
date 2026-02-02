import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis
} from 'recharts';
import { addDays, subDays, parseISO, isAfter } from 'date-fns';
import { JournalEntry, EmotionLabels, EmotionType } from '../types';
import GlassCard from './GlassCard';
import { useApp } from '../contexts/AppContext';

interface StatsProps {
  entries: JournalEntry[];
}

// Helper to get hex based on theme
const usePalette = (theme: 'light' | 'dark') => {
  return useMemo(() => {
    const isDark = theme === 'dark';
    return {
      primary: isDark ? '#818CF8' : '#6366F1',
      energyHigh: isDark ? '#34D399' : '#10B981',
      energyLow: isDark ? '#FB7185' : '#F43F5E',
      textMain: isDark ? '#E2E8F0' : '#1F2937',
      axis: isDark ? 'rgba(226, 232, 240, 0.5)' : 'rgba(31, 41, 55, 0.5)',
      grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      chartColors: [
        isDark ? '#818CF8' : '#6366F1', // Primary
        isDark ? '#34D399' : '#10B981', // High
        isDark ? '#FB7185' : '#F43F5E', // Low
        '#FBBF24', // Amber
        '#A78BFA', // Purple
        '#38BDF8'  // Sky
      ]
    };
  }, [theme]);
};

// Map emotions to a vertical scale (Negative -> Positiveish)
const EMOTION_Y_VALUE: Record<string, number> = {
  [EmotionType.Angry]: 0,
  [EmotionType.Sad]: 1,
  [EmotionType.Frustrated]: 2,
  [EmotionType.Anxious]: 3,
  [EmotionType.Neutral]: 4,
  [EmotionType.Surprised]: 5,
  [EmotionType.Excited]: 6,
  [EmotionType.Happy]: 7,
};

// Reverse map for Y-Axis labels
const getYLabel = (value: number, language: 'en' | 'fa') => {
  const emotionKey = Object.keys(EMOTION_Y_VALUE).find(key => EMOTION_Y_VALUE[key] === value);
  // @ts-ignore
  return emotionKey ? (EmotionLabels[language][emotionKey] || emotionKey) : '';
};

const getDotColor = (emotion: EmotionType, palette: any) => {
    switch (emotion) {
      case EmotionType.Angry: 
      case EmotionType.Frustrated:
          return palette.energyLow;
      case EmotionType.Happy: 
      case EmotionType.Excited:
          return palette.energyHigh;
      case EmotionType.Sad: return '#3b82f6';
      case EmotionType.Anxious: return '#f59e0b';
      case EmotionType.Surprised: return '#06b6d4';
      default: return palette.primary;
    }
};

const Stats: React.FC<StatsProps> = ({ entries }) => {
  const { t, language, theme } = useApp();
  const palette = usePalette(theme);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Process data for Emotion Frequency (Pie Chart)
  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      // @ts-ignore
      name: EmotionLabels[language][name] || name, 
      value 
    }));
  }, [entries, language]);

  // Process data for Timeline (Scatter Chart)
  const timelineData = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date | null = null;

    if (timeRange === '7d') cutoffDate = subDays(now, 7);
    if (timeRange === '30d') cutoffDate = subDays(now, 30);

    const filtered = cutoffDate 
      ? entries.filter(e => isAfter(parseISO(e.date), cutoffDate))
      : entries;

    return filtered.map(e => ({
      x: new Date(e.date).getTime(),
      y: EMOTION_Y_VALUE[e.emotion] !== undefined ? EMOTION_Y_VALUE[e.emotion] : 4,
      entry: e
    }));
  }, [entries, timeRange]);

  // Custom Tooltip for Pie Chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-slate-200 dark:border-white/5 p-2 rounded shadow-xl text-xs" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          <p className="font-bold text-textMain">
             {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Scatter Chart
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const entry: JournalEntry = data.entry;
      return (
        <div className="bg-surface/95 backdrop-blur border border-slate-200 dark:border-white/5 p-3 rounded-lg shadow-xl text-xs max-w-[200px]" dir={language === 'fa' ? 'rtl' : 'ltr'}>
           <div className="font-bold mb-1 text-sm text-textMain border-b border-slate-200 dark:border-white/10 pb-1">
             {/* @ts-ignore */}
             {EmotionLabels[language][entry.emotion]} 
             <span className="opacity-60 font-normal mx-1 text-[10px]">{new Date(entry.date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
           </div>
           <div className="space-y-1">
              <p><span className="opacity-70">{t('triggerTitle')}:</span> <span className="text-textMain/90">{entry.action}</span></p>
              <p><span className="opacity-70">{t('intensityLabel')}:</span> {entry.intensity}/10</p>
           </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-8 mb-8">
      {/* Pie Chart */}
      <GlassCard title={t('freqTitle')}>
        <div className="h-72 w-full" dir="ltr">
            {entries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-textMain/50">{t('noData')}</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={emotionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill={palette.primary}
                        dataKey="value"
                    >
                        {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={palette.chartColors[index % palette.chartColors.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
      </GlassCard>

      {/* Timeline Scatter Chart */}
      <GlassCard className="relative overflow-visible">
         <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/5 pb-2">
            <h3 className="text-xl font-bold text-textMain">{t('timelineTitle')}</h3>
            <select 
               value={timeRange}
               onChange={(e) => setTimeRange(e.target.value as any)}
               className="bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-textMain focus:outline-none"
            >
              <option value="7d">{t('range7d')}</option>
              <option value="30d">{t('range30d')}</option>
              <option value="all">{t('rangeAll')}</option>
            </select>
         </div>

         <div className="h-72 w-full" dir="ltr">
            {timelineData.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-textMain/50">{t('noData')}</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Date" 
                      domain={['auto', 'auto']}
                      tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { month: 'numeric', day: 'numeric' })}
                      stroke={palette.axis} 
                      tick={{fill: palette.axis, fontSize: 10}}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Emotion" 
                      domain={[-0.5, 7.5]} 
                      ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                      tickFormatter={(val) => getYLabel(val, language)}
                      stroke={palette.axis}
                      tick={{fill: palette.axis, fontSize: 10}}
                      width={60}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 50]} />
                    <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={timelineData} shape="circle">
                      {timelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDotColor(entry.entry.emotion, palette)} />
                      ))}
                    </Scatter>
                </ScatterChart>
                </ResponsiveContainer>
            )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Stats;