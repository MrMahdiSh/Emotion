import React, { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, Languages, Download, Upload } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SettingsToolboxProps {
    onExport: () => void;
    onImportClick: () => void;
}

const SettingsToolbox: React.FC<SettingsToolboxProps> = ({ onExport, onImportClick }) => {
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

    // In RTL (Persian), the button is on the left, so we anchor the popup to the left (left-0).
    // In LTR (English), the button is on the right, so we anchor to the right (right-0).
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
                <div className={`absolute top-14 z-50 w-56 bg-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 animate-fade-in-up ${alignmentClass}`}>
                    
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
                        onClick={() => { onExport(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-energyHigh transition-all text-sm font-medium"
                    >
                        <Download size={18} />
                        {t('exportBtn')}
                    </button>
                    
                    <button 
                        onClick={() => { onImportClick(); setIsOpen(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-bgMain text-textMain/80 hover:text-energyHigh transition-all text-sm font-medium"
                    >
                        <Upload size={18} />
                        {t('importBtn')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SettingsToolbox;