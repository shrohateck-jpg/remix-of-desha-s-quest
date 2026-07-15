import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { t, LANGUAGES, type LangCode, type Translations } from "@/i18n/translations";

const STORAGE_KEY = "desha_lang";

function getBrowserLang(): LangCode {
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("ar")) return "ar-eg";
  if (browser.startsWith("fr")) return "fr";
  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("de")) return "de";
  if (browser.startsWith("it")) return "it";
  if (browser.startsWith("pt")) return "pt";
  if (browser.startsWith("tr")) return "tr";
  if (browser.startsWith("ru")) return "ru";
  if (browser.startsWith("ja")) return "ja";
  if (browser.startsWith("ko")) return "ko";
  if (browser.startsWith("zh")) return "zh";
  if (browser.startsWith("hi")) return "hi";
  if (browser.startsWith("id")) return "id";
  return "ar-eg";
}

/** Read language synchronously — safe on both server and client */
function initLang(): LangCode {
  if (typeof window === "undefined") return "ar-eg";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (saved && t[saved]) return saved;
    return getBrowserLang();
  } catch {
    return "ar-eg";
  }
}

interface LangContextValue {
  lang: LangCode;
  tr: Translations;
  dir: "rtl" | "ltr";
  setLang: (lang: LangCode) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "ar-eg",
  tr: t["ar-eg"],
  dir: "rtl",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  // Synchronous init avoids a useEffect flash and ensures the setter works
  // on the very first render without waiting for a useEffect cycle.
  const [lang, setLangState] = useState<LangCode>(initLang);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
  }, []);

  const meta = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  // Keep <html> dir/lang in sync (client-side only)
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", meta.dir);
  }, [lang, meta.dir]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, tr: t[lang], dir: meta.dir, setLang }),
    [lang, meta.dir, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
