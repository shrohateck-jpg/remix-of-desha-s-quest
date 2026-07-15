import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { t, LANGUAGES, type LangCode, type Translations } from "@/i18n/translations";

const STORAGE_KEY = "desha_lang";

function detectLang(): LangCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (saved && t[saved]) return saved;
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
  } catch {}
  return "ar-eg";
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
  const [lang, setLangState] = useState<LangCode>("ar-eg");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch {}
  };

  const meta = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang, meta.dir]);

  return (
    <LangContext.Provider value={{ lang, tr: t[lang], dir: meta.dir, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
