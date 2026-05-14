import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'light' | 'dark' | 'custom';

export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

interface AppState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  customThemeColors: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
    surface: string;
  };
  setCustomThemeColors: (colors: Partial<AppState['customThemeColors']>) => void;
  
  showCurrencyNames: boolean;
  setShowCurrencyNames: (val: boolean) => void;
  
  hapticFeedback: boolean;
  setHapticFeedback: (val: boolean) => void;
  
  precision: number;
  setPrecision: (val: number) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  calculatorHistoryOpen: boolean;
  setCalculatorHistoryOpen: (open: boolean) => void;
  toggleCalculatorHistory: () => void;

  history: CalculationRecord[];
  addHistory: (record: Omit<CalculationRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      customThemeColors: {
        bg: '#2d001c',
        text: '#ffffff',
        primary: '#ff007f',
        accent: '#00ffcc',
        surface: '#4a0033'
      },
      setCustomThemeColors: (colors) => set((state) => ({ 
        customThemeColors: { ...state.customThemeColors, ...colors } 
      })),

      showCurrencyNames: false,
      setShowCurrencyNames: (val) => set({ showCurrencyNames: val }),

      hapticFeedback: true,
      setHapticFeedback: (val) => set({ hapticFeedback: val }),

      precision: 4,
      setPrecision: (val) => set({ precision: val }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    mobileSidebarOpen: false,
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

    calculatorHistoryOpen: true,
    setCalculatorHistoryOpen: (open) => set({ calculatorHistoryOpen: open }),
    toggleCalculatorHistory: () => set((state) => ({ calculatorHistoryOpen: !state.calculatorHistoryOpen })),

      history: [],
      addHistory: (record) => set((state) => ({
        history: [{
          ...record,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }, ...state.history]
      })),
      clearHistory: () => set({ history: [] }),
      removeHistoryItem: (id) => set((state) => ({
        history: state.history.filter(item => item.id !== id)
      }))
    }),
    {
      name: 'calc-juti-storage',
      partialize: (state) => ({
        theme: state.theme,
        customThemeColors: state.customThemeColors,
        showCurrencyNames: state.showCurrencyNames,
        hapticFeedback: state.hapticFeedback,
        precision: state.precision,
        sidebarCollapsed: state.sidebarCollapsed,
        history: state.history,
      }),
    }
  )
);
