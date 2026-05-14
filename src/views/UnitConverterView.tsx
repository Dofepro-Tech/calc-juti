import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowLeftRight } from 'lucide-react';

const unitTypes = {
  length: {
    label: 'Longitud',
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.34 }
  },
  weight: {
    label: 'Masa',
    units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 }
  },
  volume: {
    label: 'Volumen',
    units: { l: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176 }
  },
  temperature: {
    label: 'Temperatura',
    units: { C: 'C', F: 'F', K: 'K' } // specific logic needed
  }
};

export function UnitConverterView() {
  const [activeType, setActiveType] = useState<keyof typeof unitTypes>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState('');

  // Handle unit type change safely
  const handleTypeChange = (type: string) => {
    const t = type as keyof typeof unitTypes;
    setActiveType(t);
    const units = Object.keys(unitTypes[t].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  };

  const calculate = () => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';

    if (activeType === 'temperature') {
      let c = 0;
      // Convert to Celsius first
      if (fromUnit === 'C') c = num;
      if (fromUnit === 'F') c = (num - 32) * 5/9;
      if (fromUnit === 'K') c = num - 273.15;

      // Convert from Celsius
      if (toUnit === 'C') return c.toFixed(2);
      if (toUnit === 'F') return ((c * 9/5) + 32).toFixed(2);
      if (toUnit === 'K') return (c + 273.15).toFixed(2);
      return '';
    }

    const typeData = unitTypes[activeType].units as Record<string, number>;
    const baseValue = num * typeData[fromUnit];
    return (baseValue / typeData[toUnit]).toPrecision(6);
  };

  const [recentPars, setRecentPars] = useState<Record<string, string[]>>({});
  const [quickSwapIdx, setQuickSwapIdx] = useState(0);

  // Add the current pair to recentPairs whenever it changes, if not already the latest
  React.useEffect(() => {
    const pair = `${fromUnit}-${toUnit}`;
    setRecentPars(prev => {
      const typeList = prev[activeType] || [];
      if (typeList[0] === pair) return prev;
      const newList = [pair, ...typeList.filter(p => p !== pair)].slice(0, 3);
      return { ...prev, [activeType]: newList };
    });
  }, [activeType, fromUnit, toUnit]);

  React.useEffect(() => {
    setResult('');
  }, [activeType, fromUnit, toUnit, amount]);

  React.useEffect(() => {
    setResult(calculate());
  }, []);

  const handleConvert = () => {
    setResult(calculate());
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const quickSwap = () => {
    const list = recentPars[activeType] || [];
    if (list.length === 0) return;
    const nextIdx = (quickSwapIdx + 1) % list.length;
    const [fU, tU] = list[nextIdx].split('-');
    setFromUnit(fU);
    setToUnit(tU);
    setQuickSwapIdx(nextIdx);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--border)]">
        <h2 className="text-2xl font-serif font-bold text-[var(--primary)] mb-6">Conversor de Unidades</h2>

        <Tabs.Root value={activeType} onValueChange={handleTypeChange}>
          <Tabs.List className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-2">
            {Object.entries(unitTypes).map(([key, data]) => (
              <Tabs.Trigger 
                key={key} 
                value={key}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--bg)] data-[state=inactive]:hover:bg-[var(--surface-hover)] opacity-80 data-[state=active]:opacity-100"
              >
                {data.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value={activeType} className="outline-none">
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="space-y-4 w-full">
                  <label className="text-sm font-medium opacity-70">Valor y Unidad Original</label>
                  <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)]">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent px-4 py-3 outline-none font-mono text-lg"
                    />
                    <select 
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="bg-[var(--surface-hover)] px-4 py-3 outline-none font-bold border-l border-[var(--border)] cursor-pointer min-w-[70px]"
                    >
                      {Object.keys(unitTypes[activeType as keyof typeof unitTypes].units).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
               </div>
               
               <div className="shrink-0 pt-6 flex flex-col md:flex-row items-center gap-3">
                 <button 
                  onClick={swap}
                  className="p-4 bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 flex-shrink-0"
                  title="Invertir unidades"
                 >
                   <ArrowLeftRight className="w-5 h-5" />
                 </button>
                 {(recentPars[activeType] || []).length > 1 && (
                    <button
                      onClick={quickSwap}
                      className="px-3 py-1.5 text-[var(--text)] opacity-60 hover:opacity-100 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all text-xs font-bold bg-[var(--surface)] rounded-full border border-[var(--border)] shadow-sm active:scale-95 whitespace-nowrap"
                      title="Cambio rápido entre recientes"
                    >
                      Quick Swap
                    </button>
                 )}
               </div>

               <div className="space-y-4 w-full">
                  <label className="text-sm font-medium opacity-70">Resultado</label>
                  <div className="flex bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)]">
                    <div className="w-full bg-transparent px-4 py-3 font-mono text-xl font-bold flex items-center overflow-x-auto">
                      {result || 'Pulsa Convertir'}
                    </div>
                    <select 
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="bg-[var(--surface-hover)] px-4 py-3 outline-none font-bold border-l border-[var(--border)] cursor-pointer min-w-[70px]"
                    >
                      {Object.keys(unitTypes[activeType as keyof typeof unitTypes].units).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleConvert}
                disabled={!amount || Number.isNaN(parseFloat(amount))}
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Convertir
              </button>
            </div>
          </Tabs.Content>
        </Tabs.Root>

      </div>
    </div>
  );
}
