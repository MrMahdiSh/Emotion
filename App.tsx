import React, { useState, useEffect, useRef, useMemo } from 'react';
import { JournalEntry, InsightResponse, EmotionLabels } from './types';
import EntryForm from './components/EntryForm';
import EntryWizard from './components/EntryWizard';
import Stats from './components/Stats';
import JournalList from './components/JournalList';
import AIInsightModal from './components/AIInsightModal';
import SettingsToolbox from './components/SettingsToolbox';
import SplashScreen from './components/SplashScreen';
import { analyzeJournalEntries } from './services/geminiService';
import { BrainCircuit, BookOpen, Activity, Gift, Search, Calendar, X } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';

// Date Picker Imports
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// Inner App Component to use the Context
const MainApp: React.FC = () => {
  const { t, language, dir } = useApp();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'journal' | 'dashboard'>('journal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Wizard State (Hoisted for centering)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialAction, setWizardInitialAction] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  
  // filterDate can be a string (ISO for English) or a DateObject (for Persian)
  const [filterDate, setFilterDate] = useState<any>(null);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<InsightResponse | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moodmorph_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('moodmorph_entries', JSON.stringify(entries));
  }, [entries]);

  // Reset filter when language changes to avoid type mismatch
  useEffect(() => {
    setFilterDate(null);
  }, [language]);

  const addEntry = (entry: JournalEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleOpenWizard = (initialText: string) => {
    setWizardInitialAction(initialText);
    setIsWizardOpen(true);
  };

  const handleWizardSubmit = (entry: JournalEntry) => {
    addEntry(entry);
    setIsWizardOpen(false);
  };

  const handleAIAnalysis = async () => {
    setIsAIModalOpen(true);
    setIsAnalyzing(true);
    const result = await analyzeJournalEntries(entries, language);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moodmorph_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (Array.isArray(importedData)) {
          // Merge logic: avoid duplicates by ID
          setEntries(prev => {
            const currentIds = new Set(prev.map(item => item.id));
            const newItems = importedData.filter((item: any) => !currentIds.has(item.id));
            
            if (newItems.length > 0) {
              setTimeout(() => alert(t('dataImported')), 100);
              return [...newItems, ...prev];
            } else {
              setTimeout(() => alert(t('importNoNew')), 100);
              return prev;
            }
          });
        } else {
          alert(t('invalidData'));
        }
      } catch (err) {
        alert(t('invalidData'));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Filtering Logic
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      // Translate emotion to current language for searching
      // @ts-ignore
      const emotionLabel = (EmotionLabels[language][entry.emotion] || entry.emotion).toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        entry.action.toLowerCase().includes(searchLower) ||
        entry.reaction.toLowerCase().includes(searchLower) ||
        entry.result.toLowerCase().includes(searchLower) ||
        emotionLabel.includes(searchLower);

      // Date Filtering Logic
      let matchesDate = true;
      if (filterDate) {
        if (language === 'fa') {
          // If we have a Persian DateObject selection
          if (filterDate instanceof DateObject) {
             const entryDate = new Date(entry.date);
             // Convert entry date to Persian string YYYY/MM/DD
             const entryPersian = new DateObject(entryDate).convert(persian, persian_fa).format("YYYY/MM/DD");
             const filterPersian = filterDate.format("YYYY/MM/DD");
             matchesDate = entryPersian === filterPersian;
          }
        } else {
          // English: filterDate is likely string YYYY-MM-DD from native input
          if (typeof filterDate === 'string') {
              matchesDate = entry.date.startsWith(filterDate);
          }
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [entries, searchTerm, filterDate, language]);

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 bg-bgMain text-textMain font-sans dark:font-fa">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 mb-8 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-primary to-energyLow p-2 rounded-lg shadow-lg shadow-primary/30">
               <BrainCircuit size={28} className="text-white rotate-90" />
             </div>
             <h1 className="text-2xl font-bold text-textMain hidden sm:block">
               {t('title')}
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 bg-bgMain p-1 rounded-xl border border-slate-200 dark:border-white/5">
                <button
                onClick={() => setActiveTab('journal')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'journal' ? 'bg-surface text-primary shadow' : 'text-textMain/60 hover:text-textMain'}`}
                >
                <BookOpen size={18} />
                <span className="hidden sm:inline">{t('tabJournal')}</span>
                </button>
                <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-surface text-primary shadow' : 'text-textMain/60 hover:text-textMain'}`}
                >
                <Activity size={18} />
                <span className="hidden sm:inline">{t('tabStats')}</span>
                </button>
            </nav>

             <SettingsToolbox onExport={handleExport} onImportClick={handleImportClick} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Top Action Bar (AI trigger) */}
        <div className="flex justify-end">
             <button
                onClick={handleAIAnalysis}
                disabled={entries.length === 0}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all
                  bg-gradient-to-r from-energyLow to-primary hover:from-energyLow/80 hover:to-primary/80
                  shadow-lg shadow-primary/20 text-white
                  ${entries.length === 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}
                `}
              >
                <BrainCircuit size={18} />
                {t('analyzeBtn')}
              </button>
        </div>

        {activeTab === 'journal' && (
          <div className="relative">
             
             {/* Sticky Entry Form (Input Bar) */}
             <div className="sticky top-[76px] z-30 pb-6 bg-bgMain/95 backdrop-blur-sm -mx-4 px-4 pt-2">
               <EntryForm onOpenWizard={handleOpenWizard} />
             </div>

             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
                    {t('recentLogs')}
                    <span className="text-xs bg-surface border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded text-textMain/70 font-normal">
                      {filteredEntries.length} / {entries.length} {t('entriesCount')}
                    </span>
                  </h2>
                </div>

                {/* Filter Bar */}
                <div className="bg-surface border border-slate-200 dark:border-white/5 rounded-xl p-3 flex flex-col sm:flex-row gap-3 shadow-sm">
                   {/* Search Input */}
                   <div className="relative flex-1">
                      <Search className={`absolute top-1/2 -translate-y-1/2 text-textMain/40 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} size={16} />
                      <input 
                        type="text" 
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-textMain placeholder-textMain/40 ${dir === 'rtl' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className={`absolute top-1/2 -translate-y-1/2 text-textMain/40 hover:text-textMain ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                   </div>

                   {/* Date Input */}
                   <div className="relative min-w-[150px]">
                      {language === 'fa' ? (
                         <div className="w-full">
                           <DatePicker 
                             value={filterDate}
                             onChange={setFilterDate}
                             calendar={persian}
                             locale={persian_fa}
                             calendarPosition="bottom-right"
                             placeholder={t('filterDate')}
                             editable={false} // Prevents keyboard from opening on mobile
                             inputClass={`w-full bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-textMain placeholder-textMain/40 ${dir === 'rtl' ? 'pr-9 pl-3' : 'pl-9 pr-3'} cursor-pointer`}
                             containerStyle={{ width: "100%" }}
                           />
                           <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-textMain/40 z-10 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}>
                             <Calendar size={16} />
                           </div>
                         </div>
                      ) : (
                        <div className="relative">
                            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-textMain/40 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}>
                                <Calendar size={16} />
                            </div>
                            <input 
                                type="date"
                                value={typeof filterDate === 'string' ? filterDate : ''}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className={`w-full sm:w-auto bg-bgMain border border-slate-200 dark:border-white/10 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-textMain/80 ${dir === 'rtl' ? 'pr-9 pl-3' : 'pl-9 pr-3'} cursor-pointer`}
                            />
                        </div>
                      )}
                   </div>
                   
                   {/* Clear Button */}
                   {(searchTerm || filterDate) && (
                     <button 
                       onClick={() => { setSearchTerm(''); setFilterDate(null); }}
                       className="px-3 py-2 bg-bgMain hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-xs font-medium text-textMain/60 transition-colors whitespace-nowrap"
                     >
                       {t('clearFilters')}
                     </button>
                   )}
                </div>

                <JournalList entries={filteredEntries} onDelete={deleteEntry} />
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <Stats entries={entries} />
            <div className="bg-surface border border-slate-200 dark:border-white/5 rounded-xl p-8 text-center transition-colors shadow-sm">
                <h3 className="text-2xl font-bold text-textMain mb-2">{t('keepTrackingTitle')}</h3>
                <p className="text-textMain/70 max-w-lg mx-auto">
                    {t('keepTrackingDesc')}
                </p>
            </div>

            {/* Special Edition Footer - Always English */}
            <div className="flex justify-center mt-8 pb-4" dir="ltr">
              <div className="flex items-center gap-3 px-6 py-3 bg-surface border border-slate-200 dark:border-white/10 rounded-full shadow-lg hover:bg-white dark:hover:bg-white/5 transition-colors">
                <Gift size={16} className="text-energyLow" />
                <p className="text-xs sm:text-sm font-medium tracking-wide text-textMain/60">
                  <span className="text-textMain">Special Edition for Mohammad Rahimi</span> 
                  <span className="mx-2 text-textMain/20">&gt;</span> 
                  <span className="text-energyHigh">Status: Gifted</span>
                  <span className="mx-2 text-textMain/20">|</span> 
                  Crafted by: <span className="text-primary font-bold">Mahdi Shurabi</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Entry Wizard (Centered in Root) */}
      <EntryWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialAction={wizardInitialAction}
        onSubmit={handleWizardSubmit}
      />

      {/* AI Modal */}
      <AIInsightModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        isLoading={isAnalyzing}
        data={aiInsight}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      {showSplash ? <SplashScreen onFinish={() => setShowSplash(false)} /> : <MainApp />}
    </AppProvider>
  );
};

export default App;