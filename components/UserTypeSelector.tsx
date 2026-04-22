'use client';

import { UserType } from '@/types/tax';

const USER_TYPES: { id: UserType; emoji: string; title: string; desc: string; examples: string }[] = [
  {
    id: 'salary',
    emoji: '💼',
    title: 'Salary Earner',
    desc: 'I receive a regular monthly pay from an employer',
    examples: 'Civil servant, bank worker, corporate staff',
  },
  {
    id: 'freelancer',
    emoji: '💻',
    title: 'Freelancer / Self-Employed',
    desc: 'I earn from clients, gigs, or my own services',
    examples: 'Designer, developer, consultant, content creator',
  },
  {
    id: 'business',
    emoji: '🏪',
    title: 'Business Owner',
    desc: 'I run a business and pay myself from its income',
    examples: 'Shop owner, SME, trader, entrepreneur',
  },
];

interface Props {
  selected: UserType | null;
  onSelect: (type: UserType) => void;
}

export function UserTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {USER_TYPES.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            selected === t.id
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm shadow-emerald-900/10'
              : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'
          }`}
        >
          <span className="text-3xl flex-shrink-0 mt-0.5">{t.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${selected === t.id ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
              {t.title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">{t.examples}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
            selected === t.id
              ? 'border-emerald-600 bg-emerald-600'
              : 'border-slate-300 dark:border-slate-600'
          }`}>
            {selected === t.id && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
