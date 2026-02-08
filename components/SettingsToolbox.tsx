import React, { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, Languages, Download, Upload, User, Users, Stethoscope, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { UserProfile } from '../types';

interface SettingsToolboxProps {
    onExport: () => void;
    onImportClick: () => void;
    onDoctorExport: () => void;
    onDeleteData: () => void;
    onOpenProfileManager: () => void;
    currentProfile: UserProfile | null;
}

const SettingsToolbox: React.FC<SettingsToolboxProps> = ({ 
    onExport, 
    onImportClick, 
    onDoctorExport,
    onDeleteData,
    onOpenProfileManager,
    currentProfile,
}) => {
    const { t, theme, toggleTheme, language, setLanguage, dir } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const alignmentClass = dir === 'rtl' ? 'left-0 origin-top-left' : 'right-0 origin-top-right';

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-xl transition-all ${isOpen ? 'bg-primary text-white rotate-90' : 'bg-surface text-textMain/70 hover:bg-white hover:text-primary border border-slate-200 dark:border-white/10'}`}
                title={t('settings')}
            >
                <Settings size={22} />
            </button>

            {isOpen && (
                <div className={`absolute top-14 z-50 w-64 bg-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 animate-fade-in-up ${alignmentClass}`}>
                    
                    {/* Profile Info */}
                    {currentProfile && (
                        <div className="px-3 py-2 mb-1 border-b border-slate-200 dark:border-white/5">
                            <p className="text-xs text-textMain/50 uppercase tracking-wider mb-1">{t('currentUser')}</p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <User size={16} />
                                <span className="truncate">{currentProfile.name}</span>
                            </div>
                        </div>
                    )}

                    {/* Profile Manager Button */}
                    <button 
                        onClick={() => { onOpenProfileManager(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-primary transition-all text-sm font-medium"
                    >
                        <Users size={18} />
                        {t('manageProfiles')}
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

                    <button 
                        onClick={() => { onDoctorExport(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent hover:bg-primary/20 text-primary transition-all text-sm font-bold"
                    >
                        <Stethoscope size={18} />
                        {t('exportDoctorBtn')}
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

                    <button 
                        onClick={() => { toggleTheme(); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-primary transition-all text-sm font-medium"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button 
                        onClick={() => { setLanguage(language === 'fa' ? 'en' : 'fa'); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-primary transition-all text-sm font-medium"
                    >
                        <Languages size={18} />
                        {language === 'fa' ? 'English' : 'فارسی'}
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />
                    
                    <button 
                        onClick={() => { onImportClick(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-energyHigh transition-all text-sm font-medium"
                    >
                        <Upload size={18} />
                        {t('importBtn')}
                    </button>

                    <button 
                        onClick={() => { onExport(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-energyHigh transition-all text-sm font-medium opacity-60"
                        title="Legacy JSON format"
                    >
                        <Download size={18} />
                        {t('exportBtn')} (Legacy)
                    </button>
                    
                     <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

                     <button 
                        onClick={() => { onDeleteData(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-sm font-bold"
                    >
                        <Trash2 size={18} />
                        {t('deleteDataBtn')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SettingsToolbox;