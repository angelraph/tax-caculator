'use client';

const TRUST_ITEMS = [
  {
    icon: '📜',
    title: '2026 NTA & NTAA',
    body: "Built on Nigeria's Tax Act and Tax Administration Act 2026 — the most current reform.",
  },
  {
    icon: '🔒',
    title: 'Stays on your device',
    body: 'No data is ever collected, sent, or stored on any server. Everything runs locally in your browser.',
  },
  {
    icon: '⚖️',
    title: 'For estimation only',
    body: 'Results are for planning purposes. Consult a certified tax professional before filing.',
  },
];

export function TrustSection() {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <span>🔐</span>
        Why you can trust this calculator
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TRUST_ITEMS.map(item => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
