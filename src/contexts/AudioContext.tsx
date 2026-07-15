import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AudioContextValue {
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  soundEnabled: true,
  musicEnabled: false,
  toggleSound: () => {},
  toggleMusic: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("desha_sound");
      if (s !== null) setSoundEnabled(s !== "false");
      const m = localStorage.getItem("desha_music");
      if (m !== null) setMusicEnabled(m === "true");
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((v) => {
      const next = !v;
      try { localStorage.setItem("desha_sound", String(next)); } catch {}
      return next;
    });
  };

  const toggleMusic = () => {
    setMusicEnabled((v) => {
      const next = !v;
      try { localStorage.setItem("desha_music", String(next)); } catch {}
      return next;
    });
  };

  return (
    <AudioCtx.Provider value={{ soundEnabled, musicEnabled, toggleSound, toggleMusic }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
