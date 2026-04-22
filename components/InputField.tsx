'use client';

import { HelpTooltip } from './HelpTooltip';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: string;
  helpText?: string;
  min?: number;
}

export function InputField({
  label,
  value,
  onChange,
  prefix = '₦',
  suffix,
  placeholder = '0.00',
  hint,
  helpText,
  min = 0,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, '');
    const parts = raw.split('.');
    const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
    onChange(cleaned);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-start flex-wrap gap-x-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {helpText && <HelpTooltip text={helpText} />}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm font-semibold text-slate-500 dark:text-slate-400 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          className={`
            w-full rounded-lg border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-white
            text-sm font-medium
            py-2.5
            ${prefix ? 'pl-8' : 'pl-3'}
            ${suffix ? 'pr-10' : 'pr-3'}
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            transition-all duration-150
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-slate-400 dark:text-slate-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
