'use client';

import { TaxResults } from '@/types/tax';
import { formatNaira, formatPercent, encodeShareable } from '@/lib/formatters';
import { TaxInputs } from '@/types/tax';

interface Props {
  results: TaxResults;
  inputs: TaxInputs;
  shareSuccess: boolean;
  onCopyLink: () => void;
}

function buildTwitterText(results: TaxResults): string {
  const { grossAnnualIncome, totalObligation, effectiveRate, isExempt } = results;
  if (isExempt) {
    return `I just calculated my 2026 Nigeria tax! 🇳🇬\n\n✅ I earn below ₦800,000 — I pay ZERO income tax!\n\nCheck yours 👇\n\n#NigeriaTax #NTA2026`;
  }
  return `I just calculated my 2026 Nigeria tax! 🇳🇬\n\n💰 Annual Income: ${formatNaira(grossAnnualIncome, true)}\n📉 Tax Rate: ${formatPercent(effectiveRate)}\n🏦 Total Tax: ${formatNaira(totalObligation, true)}/yr\n\nCalculate yours 👇\n\n#NigeriaTax #NTA2026 #TaxReform`;
}

function buildWhatsAppText(results: TaxResults, url: string): string {
  const { grossAnnualIncome, totalObligation, monthlyIncomeTax, isExempt } = results;
  if (isExempt) {
    return `Hey! I just used this free Nigeria Tax Calculator for 2026 🇳🇬\n\nMy income is below ₦800,000 — I pay ZERO income tax!\n\nTry it yourself: ${url}`;
  }
  return `Hey! I just calculated my 2026 Nigeria tax liability 🇳🇬\n\n📊 Income: ${formatNaira(grossAnnualIncome, true)}/yr\n💸 Monthly Tax: ${formatNaira(monthlyIncomeTax)}\n🏦 Annual Tax: ${formatNaira(totalObligation)}\n\nTry it yourself: ${url}`;
}

export function ShareActions({ results, inputs, shareSuccess, onCopyLink }: Props) {
  const getShareUrl = () => {
    const encoded = encodeShareable(inputs as unknown as Record<string, unknown>);
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  };

  const handleTwitter = () => {
    const url = getShareUrl();
    const text = buildTwitterText(results);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = () => {
    const url = getShareUrl();
    const text = buildWhatsAppText(results, url);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔥</span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Share Your Results</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Let others know and help them calculate their tax too</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Twitter/X */}
        <button
          onClick={handleTwitter}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-black text-white hover:bg-zinc-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>

        {/* Copy link */}
        <button
          onClick={onCopyLink}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
            shareSuccess
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
              : 'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {shareSuccess ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
