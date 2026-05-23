// =============================================================================
// LoadingProvider.tsx
// Menyimpan state loading secara global.
// Wrap app dengan ini di _layout.tsx, lalu panggil useLoading() di mana saja.
// =============================================================================

import AppLoading from '@/shared/components/feedback/AppLoading';
import React, { createContext, useContext, useState } from 'react';

// -----------------------------------------------------------------------------
// Tipe context
// -----------------------------------------------------------------------------
type LoadingContextType = {
  // Tampilkan spinner dengan teks opsional
  showLoading: (label?: string) => void;
  // Sembunyikan spinner
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
});

// -----------------------------------------------------------------------------
// Provider — taruh di _layout.tsx
// -----------------------------------------------------------------------------
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel]     = useState<string | undefined>(undefined);

  const showLoading = (text?: string) => {
    setLabel(text);
    setVisible(true);
  };

  const hideLoading = () => {
    setVisible(false);
    setLabel(undefined);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}

      {/* Spinner fullscreen muncul di sini kalau visible = true */}
      {visible && <AppLoading fullScreen label={label} />}
    </LoadingContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Hook — panggil ini di komponen manapun
// -----------------------------------------------------------------------------
export function useLoading() {
  return useContext(LoadingContext);
}