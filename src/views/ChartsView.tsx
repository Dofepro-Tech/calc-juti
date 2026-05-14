import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { compileExpression } from '../lib/mathEngine';

const HISTORICAL_CURRENCY_ENDPOINTS = [
  (date: string, baseCurrency: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${baseCurrency}.min.json`,
  (date: string, baseCurrency: string) => `https://${date}.currency-api.pages.dev/v1/currencies/${baseCurrency}.min.json`,
];

async function fetchHistoricalRate(date: string, fromCurrency: string, toCurrency: string) {
  const baseCurrency = fromCurrency.toLowerCase();
  const quoteCurrency = toCurrency.toLowerCase();
  let lastError: unknown;

  for (const buildUrl of HISTORICAL_CURRENCY_ENDPOINTS) {
    try {
      const response = await fetch(buildUrl(date, baseCurrency));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rate = data?.[baseCurrency]?.[quoteCurrency];
      if (typeof rate === 'number' && Number.isFinite(rate)) {
        return rate;
      }

      throw new Error('Missing rate');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Failed to fetch historical rate');
}

export function ChartsView() {
  const [chartType, setChartType] = useState<'currency' | 'math'>('currency');
  
  // Currency State
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencyData, setCurrencyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'COP']);

  // Math State
  const [mathExpression, setMathExpression] = useState('sin(x)');
  const [mathData, setMathData] = useState<any[]>([]);
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');

  useEffect(() => {
    // Fetch full currencies list para que coincida con el conversor real
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
         setCurrencies(Object.keys(data.rates).sort());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (chartType === 'currency') {
       fetchCurrencyHistory();
    } else {
       generateMathData();
    }
  }, [chartType, fromCurrency, toCurrency, mathExpression, xMin, xMax]);

  const fetchCurrencyHistory = async () => {
    if (fromCurrency === toCurrency) {
      setCurrencyData([]);
      return;
    }
    
    setLoading(true);
    try {
      const dates = Array.from({ length: 31 }, (_, index) => format(subDays(new Date(), 30 - index), 'yyyy-MM-dd'));
      const chartPoints = await Promise.all(
        dates.map(async (date) => {
          try {
            const value = await fetchHistoricalRate(date, fromCurrency, toCurrency);
            return {
              date: date.substring(5),
              value,
            };
          } catch {
            return null;
          }
        }),
      );

      setCurrencyData(chartPoints.filter((point): point is { date: string; value: number } => point !== null));
    } catch {
      setCurrencyData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMathData = () => {
    try {
      const min = parseFloat(xMin) || -10;
      const max = parseFloat(xMax) || 10;
      if (min >= max) return;

      const step = (max - min) / 50;
      const data = [];
      const expr = compileExpression(mathExpression);
      
      for (let x = min; x <= max; x += step) {
        data.push({
          x: x.toFixed(2),
          y: expr.evaluate({ x })
        });
      }
      setMathData(data);
    } catch (e) {
      // invalid expression, ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--border)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-serif font-bold text-[var(--primary)] text-left">Gráficos y Tendencias</h2>
          
          <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden p-1">
             <button 
                onClick={() => setChartType('currency')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === 'currency' ? 'bg-[var(--primary)] text-[var(--bg)]' : 'hover:bg-[var(--surface-hover)]' }`}
             >
               Divisas
             </button>
             <button 
                onClick={() => setChartType('math')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === 'math' ? 'bg-[var(--primary)] text-[var(--bg)]' : 'hover:bg-[var(--surface-hover)]' }`}
             >
               Función Científica
             </button>
          </div>
        </div>

        {chartType === 'currency' ? (
          <div className="space-y-6">
            <div className="flex gap-4">
               <div>
                  <label className="text-sm opacity-70 block mb-1">Moneda Base</label>
                  <select 
                     value={fromCurrency} 
                     onChange={e => setFromCurrency(e.target.value)}
                     className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-sm opacity-70 block mb-1">A Moneda</label>
                  <select 
                     value={toCurrency} 
                     onChange={e => setToCurrency(e.target.value)}
                     className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            <div className="h-80 w-full mt-8 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
              {loading ? (
                 <div className="h-full flex items-center justify-center opacity-50">Cargando datos históricos...</div>
              ) : currencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={currencyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--text)" fontSize={12} opacity={0.7} />
                      <YAxis stroke="var(--text)" fontSize={12} opacity={0.7} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }} />
                      <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-50 text-center">
                   <p className="font-bold">No hay datos históricos disponibles.</p>
                   <p className="text-xs mt-2 opacity-80">(El banco de historial público es limitado a divisas del BCE).</p>
                 </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex flex-wrap gap-4">
               <div className="flex-1 min-w-[200px]">
                  <label className="text-sm opacity-70 block mb-1">Función de 'x' (Ej: 2*sin(x))</label>
                  <input 
                     type="text" 
                     value={mathExpression} 
                     onChange={e => setMathExpression(e.target.value)}
                     className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
                  />
               </div>
               <div className="w-24">
                  <label className="text-sm opacity-70 block mb-1">x min</label>
                  <input type="number" value={xMin} onChange={e => setXMin(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none font-mono" />
               </div>
               <div className="w-24">
                  <label className="text-sm opacity-70 block mb-1">x max</label>
                  <input type="number" value={xMax} onChange={e => setXMax(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-xl outline-none font-mono" />
               </div>
             </div>

             <div className="h-80 w-full mt-8 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)]">
               {mathData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={mathData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="x" stroke="var(--text)" fontSize={12} opacity={0.7} />
                      <YAxis stroke="var(--text)" fontSize={12} opacity={0.7} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }} />
                      <Line type="monotone" dataKey="y" stroke="var(--accent)" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center opacity-50">Función inválida o sin datos</div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
