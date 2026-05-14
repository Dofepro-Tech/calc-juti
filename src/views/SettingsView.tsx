import React from 'react';
import { useAppStore } from '../store/useAppStore';

export function SettingsView() {
  const { 
    theme, setTheme, 
    customThemeColors, setCustomThemeColors,
    showCurrencyNames, setShowCurrencyNames,
    hapticFeedback, setHapticFeedback,
    precision, setPrecision
  } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-sm border border-[var(--border)] space-y-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--primary)] mb-6">Ajustes</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
               Apariencia
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  checked={theme === 'light'} 
                  onChange={() => setTheme('light')}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                <span className="font-medium">Tema Claro</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  checked={theme === 'dark'} 
                  onChange={() => setTheme('dark')}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                <span className="font-medium">Tema Oscuro</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  checked={theme === 'gradient'} 
                  onChange={() => setTheme('gradient')}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                <span className="font-medium">Tema Gradiente</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  checked={theme === 'custom'} 
                  onChange={() => setTheme('custom')}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                <span className="font-medium">Tema Personalizado</span>
              </label>
            </div>
          </div>

          {theme === 'custom' && (
            <div className="space-y-4 bg-[var(--bg)] p-4 rounded-2xl border border-[var(--border)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <h4 className="font-medium text-sm text-[var(--primary)] uppercase tracking-wider mb-4">Colores Personalizados</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary', label: 'Color Principal' },
                  { key: 'accent', label: 'Color Acento' },
                  { key: 'bg', label: 'Fondo' },
                  { key: 'surface', label: 'Fondo de Tarjetas' },
                  { key: 'text', label: 'Texto Principal' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold opacity-70 z-10">{label}</label>
                    <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
                      <input 
                        type="color" 
                        value={customThemeColors[key as keyof typeof customThemeColors]} 
                        onChange={(e) => setCustomThemeColors({ [key]: e.target.value })}
                        aria-label={label}
                        className="w-12 h-12 p-0 border-0 outline-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={customThemeColors[key as keyof typeof customThemeColors]} 
                        onChange={(e) => setCustomThemeColors({ [key]: e.target.value })}
                        aria-label={`${label} en hexadecimal`}
                        className="flex-1 bg-transparent px-3 text-sm font-mono outline-none uppercase"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
               Preferencias Generales
            </h3>
            
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
              <span className="font-medium text-sm md:text-base">Nombres completos de divisas</span>
              <input 
                type="checkbox" 
                checked={showCurrencyNames} 
                onChange={(e) => setShowCurrencyNames(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
              <span className="font-medium text-sm md:text-base">Vibración al tocar teclas (Háptica)</span>
              <input 
                type="checkbox" 
                checked={hapticFeedback} 
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
            </label>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] transition-colors">
              <span className="font-medium text-sm md:text-base">Precisión (Decimales)</span>
              <select 
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                aria-label="Precision decimal"
                className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-bold rounded-lg ml-4 px-2 py-1 max-w-[120px] outline-none text-sm"
              >
                <option value={2}>2 Decimales</option>
                <option value={4}>4 Decimales</option>
                <option value={6}>6 Decimales</option>
                <option value={8}>8 Decimales</option>
                <option value={10}>10 Decimales</option>
              </select>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
