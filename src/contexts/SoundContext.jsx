import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import refillStartVoice from "../assets/voices/리필시작.mp3";
import qrCheckVoice from "../assets/voices/qr제품확인.mp3";
import containerCheckVoice from "../assets/voices/리필빈병확인.mp3";

const SoundContext = createContext(null);

const SOUND_SOURCES = {
  REFILL_START: refillStartVoice,
  QR_PRODUCT_CHECK: qrCheckVoice,
  CONTAINER_CHECK: containerCheckVoice,
};

export function SoundProvider({ children }) {
  const playersRef = useRef({});

  useEffect(() => {
    // Preload all registered sounds once for snappy playback
    playersRef.current = Object.entries(SOUND_SOURCES).reduce((acc, [key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      acc[key] = audio;
      return acc;
    }, {});
  }, []);

  const playSound = useCallback((id) => {
    const player = playersRef.current[id];
    if (!player) return Promise.resolve();

    player.currentTime = 0;
    const playPromise = player.play();

    if (playPromise?.catch) {
      playPromise.catch((err) => console.warn(`⚠️ [Audio] ${id} 재생 실패:`, err));
    }

    return playPromise;
  }, []);

  const value = useMemo(() => ({ playSound }), [playSound]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
