import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES } from "@/i18n/translations";
import { useLang } from "@/contexts/LangContext";

export function LanguageSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40"
        aria-label="Select language"
      >
        <Globe size={13} className="text-muted-foreground" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline max-w-[80px] truncate">{current.nativeName}</span>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute end-0 top-full z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl p-1.5 shadow-xl"
            dir="ltr"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm font-semibold transition-all hover:bg-primary/15 ${
                  lang === l.code ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <div className="min-w-0">
                  <p className="truncate">{l.nativeName}</p>
                  <p className="truncate text-[10px] opacity-60">{l.label}</p>
                </div>
                {lang === l.code && (
                  <span className="ms-auto text-primary-glow">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
