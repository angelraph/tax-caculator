import { Header } from '@/components/Header';
import { TaxCalculator } from '@/components/TaxCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header />
      <TaxCalculator />
    </div>
  );
}
