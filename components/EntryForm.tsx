import React, { useState } from 'react';
import { Plus, PenLine } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface EntryFormProps {
  onOpenWizard: (initialText: string) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onOpenWizard }) => {
  const { t } = useApp();
  const [initialAction, setInitialAction] = useState('');

  const handleInputClick = () => {
    onOpenWizard(initialAction);
    setInitialAction('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialAction(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          onOpenWizard(initialAction);
          setInitialAction('');
      }
  };

  return (
    <div className="w-full bg-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg p-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-primary/50 group">
         <div className="p-3 bg-bgMain rounded-xl text-primary">
            <PenLine size={20} />
         </div>
         <input 
            type="text" 
            value={initialAction}
            onChange={handleInputChange}
            onClick={() => {}} // We let them type, only button or enter triggers wizard to allow typing comfortably
            onKeyDown={handleInputKeyDown}
            placeholder={t('triggerPlaceholder')}
            className="flex-1 bg-transparent border-none focus:outline-none text-textMain placeholder-textMain/40 text-lg py-2"
         />
         <button 
           onClick={handleInputClick}
           className="p-3 bg-gradient-to-r from-primary to-energyLow text-white rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
         >
           <Plus size={24} />
         </button>
    </div>
  );
};

export default EntryForm;