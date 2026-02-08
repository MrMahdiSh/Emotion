import React, { useState, useEffect, useRef, useMemo } from 'react';
import { JournalEntry, InsightResponse, EmotionLabels, UserProfile, ExportPackage } from './types';
import EntryForm from './components/EntryForm';
import EntryWizard from './components/EntryWizard';
import Stats from './components/Stats';
import JournalList from './components/JournalList';
import AIInsightModal from './components/AIInsightModal';
import SettingsToolbox from './components/SettingsToolbox';
import SplashScreen from './components/SplashScreen';
import OnboardingModal from './components/OnboardingModal';
import ExportModal from './components/ExportModal';
import DeleteDataModal from './components/DeleteDataModal';
import ProfileManagerModal from './components/ProfileManagerModal';
import { analyzeJournalEntries } from './services/geminiService';
import { BrainCircuit, BookOpen, Activity, Gift, Search, Calendar, X } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { subDays, isAfter } from 'date-fns';

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
  
  // User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);

  // Wizard State (Hoisted for centering)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialAction, setWizardInitialAction] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Date (Global Context) - Defaults to Today
  const [activeDate, setActiveDate] = useState<any>(new Date());

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<InsightResponse | null>(null);

  // Initialize correct date object based on language on mount
  useEffect(() => {
    if (language === 'fa') {
      setActiveDate(new DateObject({ calendar: persian, locale: persian_fa }));
    } else {
      setActiveDate(new Date());
    }
  }, [language]);

  // Load User & Profiles from LocalStorage on mount
  useEffect(() => {
    // 1. Load Profiles List
    const savedProfiles = localStorage.getItem('moodmorph_profiles');
    if (savedProfiles) {
        setAvailableProfiles(JSON.parse(savedProfiles));
    }

    // 2. Load Current User Info
    const savedUser = localStorage.getItem('moodmorph_current_user');
    if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        // 3. Load Entries for this user
        const savedEntries = localStorage.getItem(`moodmorph_entries_${JSON.parse(savedUser).id}`);
        if (savedEntries) {
             setEntries(JSON.parse(savedEntries));
        } else {
             // Fallback to legacy structure if specific user entries not found
             const legacyEntries = localStorage.getItem('moodmorph_entries');
             if (legacyEntries) setEntries(JSON.parse(legacyEntries));
        }
    } else {
        // No user found, check if legacy data exists. If so, migrate it later, but first ask for Name
        setIsOnboardingOpen(true);
    }
  }, []);

  // Save Entries to LocalStorage on change (User-scoped)
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`moodmorph_entries_${currentUser.id}`, JSON.stringify(entries));
    } else {
        // Legacy fallback logic only if no user set yet (shouldn't happen after onboarding)
        localStorage.setItem('moodmorph_entries', JSON.stringify(entries));
    }
  }, [entries, currentUser]);

  const handleOnboardingComplete = (profile: UserProfile) => {
      setCurrentUser(profile);
      setAvailableProfiles(prev => [...prev, profile]);
      localStorage.setItem('moodmorph_current_user', JSON.stringify(profile));
      localStorage.setItem('moodmorph_profiles', JSON.stringify([...availableProfiles, profile]));
      
      // Check for legacy entries and migrate them to this new user
      const legacyEntries = localStorage.getItem('moodmorph_entries');
      if (legacyEntries && entries.length === 0) {
          const parsed = JSON.parse(legacyEntries);
          setEntries(parsed);
          localStorage.setItem(`moodmorph_entries_${profile.id}`, legacyEntries);
          // Optional: Clear legacy key? localStorage.removeItem('moodmorph_entries');
      }
      
      setIsOnboardingOpen(false);
  };

  const handleProfileSwitch = (profileId: string) => {
      // 1. Find target profile
      const targetProfile = availableProfiles.find(p => p.id === profileId);
      if (!targetProfile) return;

      // 2. Save current user state is already handled by the entries useEffect

      // 3. Load target user data
      const targetEntries = localStorage.getItem(`moodmorph_entries_${profileId}`);
      
      // 4. Update State
      setCurrentUser(targetProfile);
      setEntries(targetEntries ? JSON.parse(targetEntries) : []);
      localStorage.setItem('moodmorph_current_user', JSON.stringify(targetProfile));
      setIsProfileManagerOpen(false);
  };

  const handleDeleteProfile = (profileId: string) => {
      // 1. Remove from profiles list
      const updatedProfiles = availableProfiles.filter(p => p.id !== profileId);
      setAvailableProfiles(updatedProfiles);
      localStorage.setItem('moodmorph_profiles', JSON.stringify(updatedProfiles));

      // 2. Remove stored entries
      localStorage.removeItem(`moodmorph_entries_${profileId}`);

      // 3. If deleted profile was current, switch or reset
      if (currentUser?.id === profileId) {
          if (updatedProfiles.length > 0) {
              handleProfileSwitch(updatedProfiles[0].id);
          } else {
              setCurrentUser(null);
              setEntries([]);
              localStorage.removeItem('moodmorph_current_user');
              localStorage.removeItem('moodmorph_entries'); // legacy cleanup
              setIsProfileManagerOpen(false);
              setIsOnboardingOpen(true);
          }
      }
  };

  const addEntry = (entry: JournalEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteData = (range: '7d' | '30d' | 'all' | 'custom', start?: string, end?: string) => {
      if (range === 'all') {
          setEntries([]);
      } else {
          setEntries(prev => {
              const now = new Date();
              let cutoff: Date;

              if (range === '7d') {
                  cutoff = subDays(now, 7);
                  // Keep entries strictly BEFORE the cutoff (older than 7 days)
                  return prev.filter(e => !isAfter(new Date(e.date), cutoff));
              } else if (range === '30d') {
                  cutoff = subDays(now, 30);
                  return prev.filter(e => !isAfter(new Date(e.date), cutoff));
              } else if (range === 'custom' && start && end) {
                  const startDate = new Date(start); startDate.setHours(0,0,0,0);
                  const endDate = new Date(end); endDate.setHours(23,59,59,999);
                  // Keep entries NOT in the range
                  return prev.filter(e => {
                      const d = new Date(e.date);
                      return d < startDate || d > endDate;
                  });
              }
              return prev;
          });
      }
      alert(t('dataDeleted'));
  };

  const handleOpenWizard = (initialText: string) => {
    setWizardInitialAction(initialText);
    setEditingEntry(null);
    setIsWizardOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setWizardInitialAction(entry.action);
    setIsWizardOpen(true);
  };

  const handleWizardSubmit = (entry: JournalEntry) => {
    if (editingEntry) {
        setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
        setEditingEntry(null);
    } else {
        addEntry(entry);
    }
    setIsWizardOpen(false);
  };

  const handleAIAnalysis = async () => {
    setIsAIModalOpen(true);
    setIsAnalyzing(true);
    const result = await analyzeJournalEntries(entries, language);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  // Legacy Export (Dump all JSON)
  const handleLegacyExport = async () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const fileName = `moodmorph_legacy_${new Date().toISOString().split('T')[0]}`;
    
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
        console.error(e);
        alert("Export failed: " + e.message);
    }
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
        
        // CHECK 1: Is it a new "ExportPackage" format?
        if (importedData.user && Array.isArray(importedData.entries)) {
             const pkg = importedData as ExportPackage;
             
             // 1. Upsert Profile
             let profilesList = [...availableProfiles];
             const existingIndex = profilesList.findIndex(p => p.id === pkg.user.id);
             
             if (existingIndex === -1) {
                 profilesList.push(pkg.user);
                 setAvailableProfiles(profilesList);
                 localStorage.setItem('moodmorph_profiles', JSON.stringify(profilesList));
             } else {
                 // Update profile info if needed (e.g. name changed in export)
                 profilesList[existingIndex] = pkg.user;
                 setAvailableProfiles(profilesList);
                 localStorage.setItem('moodmorph_profiles', JSON.stringify(profilesList));
             }

             // 2. Merge/Update Entries for that user
             const targetStorageKey = `moodmorph_entries_${pkg.user.id}`;
             const existingStored = localStorage.getItem(targetStorageKey);
             const existingEntries = existingStored ? JSON.parse(existingStored) : [];
             
             const incomingEntries = pkg.entries;
             // Merge strategy: Overwrite existing IDs with incoming, add new ones
             const idMap = new Map();
             existingEntries.forEach((e: any) => idMap.set(e.id, e));
             incomingEntries.forEach((e: any) => idMap.set(e.id, e));
             const finalEntries = Array.from(idMap.values());

             localStorage.setItem(targetStorageKey, JSON.stringify(finalEntries));

             // 3. UX Handling
             if (currentUser?.id === pkg.user.id) {
                 setEntries(finalEntries as JournalEntry[]);
                 alert(t('dataImported'));
             } else {
                 // It was for another user
                 const message = t('importProfileAddedDesc').replace('{name}', pkg.user.name);
                 const confirmSwitch = window.confirm(message);
                 if (confirmSwitch) {
                     handleProfileSwitch(pkg.user.id);
                 } else {
                     alert(t('dataImported'));
                 }
             }

        } 
        // CHECK 2: Legacy Array Format
        else if (Array.isArray(importedData)) {
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
        console.error(err);
        alert(t('invalidData'));
      }
      // Always reset input
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Filtering Logic
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      // @ts-ignore
      const emotionLabel = (EmotionLabels[language][entry.emotion] || entry.emotion).toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        entry.action.toLowerCase().includes(searchLower) ||
        entry.reaction.toLowerCase().includes(searchLower) ||
        entry.result.toLowerCase().includes(searchLower) ||
        emotionLabel.includes(searchLower);

      let matchesDate = false;
      const entryDate = new Date(entry.date);

      if (activeDate) {
        if (language === 'fa') {
          if (activeDate instanceof DateObject) {
             const entryPersian = new DateObject(entryDate).convert(persian, persian_fa).format("YYYY/MM/DD");
             const activePersian = activeDate.format("YYYY/MM/DD");
             matchesDate = entryPersian === activePersian;
          } else {
             matchesDate = true; 
          }
        } else {
          let activeDateObj: Date;
          if (activeDate instanceof Date) {
            activeDateObj = activeDate;
          } else if (typeof activeDate === 'string') {
             activeDateObj = new Date(activeDate);
          } else if (activeDate instanceof DateObject) {
             activeDateObj = activeDate.toDate();
          } else {
             activeDateObj = new Date();
          }
          
          matchesDate = 
             entryDate.getDate() === activeDateObj.getDate() &&
             entryDate.getMonth() === activeDateObj.getMonth() &&
             entryDate.getFullYear() === activeDateObj.getFullYear();
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [entries, searchTerm, activeDate, language]);

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
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
             <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-primary to-energyLow p-2 rounded-lg shadow-lg shadow-primary/30 hidden sm:block">
                  <BrainCircuit size={28} className="text-white rotate-90" />
                </div>
                <h1 className="text-2xl font-bold text-textMain hidden sm:block">
                  {t('title')}
                </h1>
             </div>
          </div>
          
          {/* Global Date Picker (Center/Right) */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            
            {/* Date Selector */}
            <div className="relative group">
              {language === 'fa' ? (
                 <div className="w-40 sm:w-48">
                   <DatePicker 
                     value={activeDate}
                     onChange={setActiveDate}
                     calendar={persian}
                     locale={persian_fa}
                     calendarPosition="bottom-center"
                     placeholder={t('filterDate')}
                     editable={false}
                     inputClass={`w-full bg-bgMain/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-center font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-bgMain transition-colors shadow-sm`}
                     containerStyle={{ width: "100%" }}
                   />
                 </div>
              ) : (
                 <div className="relative w-40 sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                       <Calendar size={16} />
                    </div>
                     <input 
                        type="date"
                        value={activeDate instanceof Date ? activeDate.toISOString().split('T')[0] : (typeof activeDate === 'string' ? activeDate : '')}
                        onChange={(e) => setActiveDate(new Date(e.target.value))}
                        className="w-full bg-bgMain/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-bgMain transition-colors shadow-sm appearance-none"
                    />
                 </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-bgMain p-1 rounded-xl border border-slate-200 dark:border-white/5">
                <button
                onClick={() => setActiveTab('journal')}
                className={`p-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'journal' ? 'bg-surface text-primary shadow' : 'text-textMain/60 hover:text-textMain'}`}
                title={t('tabJournal')}
                >
                <BookOpen size={20} />
                </button>
                <button
                onClick={() => setActiveTab('dashboard')}
                className={`p-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-surface text-primary shadow' : 'text-textMain/60 hover:text-textMain'}`}
                title={t('tabStats')}
                >
                <Activity size={20} />
                </button>
            </nav>

             <SettingsToolbox 
                onExport={handleLegacyExport} 
                onImportClick={handleImportClick}
                onDoctorExport={() => setIsExportModalOpen(true)}
                onDeleteData={() => setIsDeleteModalOpen(true)}
                onOpenProfileManager={() => setIsProfileManagerOpen(true)}
                currentProfile={currentUser}
             />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 space-y-8">

        {activeTab === 'journal' && (
          <div className="relative">
             <div className="sticky top-[80px] z-30 pb-6 bg-bgMain/95 backdrop-blur-sm -mx-4 px-4 pt-2">
               <EntryForm onOpenWizard={handleOpenWizard} />
             </div>

             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
                    {t('recentLogs')}
                    <span className="text-xs bg-surface border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded text-textMain/70 font-normal">
                      {filteredEntries.length} {t('entriesCount')}
                    </span>
                  </h2>
                </div>

                <div className="bg-surface border border-slate-200 dark:border-white/5 rounded-xl p-3 flex gap-3 shadow-sm">
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
                </div>

                <JournalList entries={filteredEntries} onDelete={deleteEntry} onEdit={handleEditEntry} />
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <Stats entries={entries} onEdit={handleEditEntry} />
            <div className="bg-surface border border-slate-200 dark:border-white/5 rounded-xl p-8 text-center transition-colors shadow-sm">
                <h3 className="text-2xl font-bold text-textMain mb-2">{t('keepTrackingTitle')}</h3>
                <p className="text-textMain/70 max-w-lg mx-auto">
                    {t('keepTrackingDesc')}
                </p>
            </div>
            
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

      <EntryWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialAction={wizardInitialAction}
        onSubmit={handleWizardSubmit}
        selectedDate={activeDate}
        editingEntry={editingEntry}
      />

      <AIInsightModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        isLoading={isAnalyzing}
        data={aiInsight}
      />

      {isOnboardingOpen && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {currentUser && (
        <>
            <ExportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                entries={entries}
                user={currentUser}
            />
            <DeleteDataModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteData}
            />
            <ProfileManagerModal
                isOpen={isProfileManagerOpen}
                onClose={() => setIsProfileManagerOpen(false)}
                profiles={availableProfiles}
                currentProfile={currentUser}
                onSwitch={handleProfileSwitch}
                onDelete={handleDeleteProfile}
                onImport={handleImportClick}
            />
        </>
      )}
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