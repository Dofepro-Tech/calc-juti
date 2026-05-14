import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Star, Search } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getCurrencyFullName } from '../lib/utils';
import { useAuthUser } from '../hooks/useAuthUser';

function SearchableSelect({ 
  value, 
  onChange, 
  currencies, 
  showNames, 
  align = 'left',
  textColorClass = 'text-[var(--text)]',
  className = ''
}: { 
  value: string; 
  onChange: (val: string) => void; 
  currencies: string[]; 
  showNames: boolean;
  align?: 'left' | 'right';
  textColorClass?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = currencies.filter(c => 
    c.toLowerCase().includes(search.toLowerCase()) || 
    getCurrencyFullName(c, true).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button 
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={`flex items-center justify-between gap-2 font-bold ${textColorClass} outline-none w-full min-w-[70px] cursor-pointer text-sm md:text-base`}
        title={getCurrencyFullName(value, true)}
      >
        <span className="truncate text-left whitespace-nowrap overflow-hidden text-ellipsis">
          {getCurrencyFullName(value, showNames)}
        </span>
        <span className="text-[10px] opacity-60 shrink-0">▼</span>
      </button>

      {open && (
        <div className={`absolute top-full mt-2 w-[240px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 flex flex-col ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="p-2 border-b border-[var(--border)] shrink-0 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input 
              type="text" 
              autoFocus
              placeholder="Buscar divisa..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm opacity-50">No encontrada</div>
            ) : (
              filtered.map(c => {
                const isSelected = c === value;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-between ${isSelected ? 'text-[var(--primary)] font-bold bg-[var(--primary)] bg-opacity-5' : 'text-[var(--text)]'}`}
                  >
                    <span className="truncate pr-2 relative top-[1px]">
                      {getCurrencyFullName(c, true)}
                    </span>
                    {isSelected && <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--primary)]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CurrencyView() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSwapIdx, setQuickSwapIdx] = useState(0);
  const [highlightedPair, setHighlightedPair] = useState<string | null>(null);
  const user = useAuthUser();
  
  const { showCurrencyNames, precision } = useAppStore();

  useEffect(() => {
    fetchRates();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      // API oficial y gratuita con más de 160 divisas reales (ExchangeRate-API)
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setRates(data.rates);
    } catch (error) {
      console.error(error);
      // Backup sólo si está offline (sin usar datos inventados amplios)
      setRates({ USD: 1, EUR: 0.94 });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const q = collection(db, `users/${user.uid}/favorites`);
      const snapshot = await getDocs(q);
      const favs = snapshot.docs.map(doc => doc.data().pair as string);
      setFavorites(favs);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/favorites`);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert("Por favor accede para guardar favoritos");
      return;
    }
    const pair = `${fromCurrency}-${toCurrency}`;
    try {
      if (favorites.includes(pair)) {
         const q = collection(db, `users/${user.uid}/favorites`);
         const snapshot = await getDocs(q);
         const targetDoc = snapshot.docs.find(d => d.data().pair === pair);
         if (targetDoc) {
           await deleteDoc(doc(db, `users/${user.uid}/favorites`, targetDoc.id));
         }
         setFavorites(prev => prev.filter(p => p !== pair));
      } else {
         await addDoc(collection(db, `users/${user.uid}/favorites`), {
           pair,
           createdAt: serverTimestamp()
         });
         setFavorites(prev => [...prev, pair]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/favorites`);
    }
  };

  useEffect(() => {
    if (Object.keys(rates).length > 0 && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
         // Rates are relative to USD
         const fromRate = rates[fromCurrency] || 1;
         const toRate = rates[toCurrency] || 1;
         const valInUsd = numAmount / fromRate;
         const converted = valInUsd * toRate;
         setResult(converted);
      } else {
         setResult(null);
      }
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const triggerHighlight = (pairToHighlight: string) => {
    setHighlightedPair(pairToHighlight);
    setTimeout(() => {
      setHighlightedPair(null);
    }, 1500);
  };

  const quickSwap = () => {
    if (favorites.length === 0) return;
    const nextIdx = (quickSwapIdx + 1) % Math.min(3, favorites.length);
    const pairString = favorites[nextIdx];
    const [fC, tC] = pairString.split('-');
    setFromCurrency(fC);
    setToCurrency(tC);
    setQuickSwapIdx(nextIdx);
    triggerHighlight(pairString);
  };

  const currencies = Object.keys(rates).sort((a, b) => {
    return getCurrencyFullName(a, true).localeCompare(getCurrencyFullName(b, true));
  });
  
  const pair = `${fromCurrency}-${toCurrency}`;
  const isFavorite = favorites.includes(pair);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-[var(--primary)]">Conversor de Divisas</h2>
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-full transition-all active:scale-95 shadow-sm ${isFavorite ? 'text-[var(--primary)] bg-[var(--accent)] bg-opacity-20 border border-[var(--accent)] border-opacity-30' : 'text-gray-400 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)]' }`}
            title="Guardar como favorito"
          >
            <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center opacity-50 font-medium animate-pulse">Sincronizando tasas de cambio...</div>
        ) : (
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* From */}
            <div className="relative w-full">
              <label className="text-[10px] absolute top-2 left-3 font-bold text-[var(--text)] opacity-40 uppercase z-10">Desde</label>
              <div className="pt-6 pb-2 px-3 border border-[var(--border)] bg-[var(--bg)] rounded-2xl flex items-center justify-between overflow-visible focus-within:border-[var(--primary)] transition-colors focus-within:shadow-[0_0_0_3px_var(--surface-hover)] relative">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full min-w-[50px] bg-transparent px-2 outline-none font-mono text-xl font-bold text-left md:text-right"
                  min="0"
                />
                
                <SearchableSelect 
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  currencies={currencies}
                  showNames={showCurrencyNames ? true : fromCurrency !== fromCurrency /* hack to show code only if false */}
                  className="pl-2 md:pl-4 border-l border-[var(--border)] max-w-[140px] md:max-w-[180px]"
                />
              </div>
            </div>

            {/* Swap & Quick Swap */}
            <div className="flex flex-col justify-center items-center py-2 md:py-6 gap-3">
              <button 
                onClick={swap}
                className="p-4 bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 flex-shrink-0"
                title="Invertir divisas"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
              {favorites.length > 0 && (
                <button
                  onClick={quickSwap}
                  className="px-3 py-1.5 text-[var(--text)] opacity-60 hover:opacity-100 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all text-xs font-bold bg-[var(--surface)] rounded-full border border-[var(--border)] shadow-sm active:scale-95 whitespace-nowrap"
                  title="Cambio rápido entre recientes"
                >
                  Quick Swap
                </button>
              )}
            </div>

            {/* To */}
            <div className="relative w-full">
              <label className="text-[10px] absolute top-2 left-3 font-bold text-[var(--primary)] uppercase z-10">Hacia</label>
              <div className="pt-6 pb-2 px-3 border border-[var(--primary)] border-opacity-30 bg-[var(--primary)] bg-opacity-5 rounded-2xl flex items-center justify-between overflow-visible relative">
                <div className="w-full bg-transparent px-2 font-mono text-2xl font-bold flex items-center justify-start md:justify-end overflow-x-auto text-[var(--text)]">
                  {result !== null ? result.toFixed(precision) : '-'}
                </div>
                
                <SearchableSelect 
                  value={toCurrency}
                  onChange={setToCurrency}
                  currencies={currencies}
                  showNames={showCurrencyNames ? true : toCurrency !== toCurrency /* hack to show code only if false */}
                  align="right"
                  textColorClass="text-[var(--text)]"
                  className="pl-2 md:pl-4 border-l border-[var(--primary)] border-opacity-30 max-w-[140px] md:max-w-[180px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {favorites.length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
          <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[var(--accent)]" fill="currentColor" />
            Pares Rápidos
          </h3>
          <div className="flex flex-wrap gap-3">
            {favorites.map(f => {
              const [fC, tC] = f.split('-');
              const isHighlighted = f === highlightedPair;
              return (
                <button 
                  key={f}
                  onClick={() => { setFromCurrency(fC); setToCurrency(tC); triggerHighlight(f); }}
                  className={`px-4 py-2 rounded-xl border font-medium transition-all shadow-sm text-sm flex items-center gap-2 ${
                    isHighlighted 
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] scale-105 shadow-md flex-shrink-0' 
                      : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text)]'
                  }`}
                >
                  <span className="font-bold">{fC}</span>
                  <span className={isHighlighted ? "opacity-90 text-xs" : "opacity-50 text-xs"}>➔</span>
                  <span className="font-bold">{tC}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
