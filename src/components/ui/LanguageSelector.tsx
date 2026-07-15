import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES } from "@/i18n/translations";
import { useLang } from "@/contexts/LangContext";

export function LanguageSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  /** Use onBlur on the container to close when focus leaves — pure React,
   *  no document-level listeners that can race with synthetic click events. */
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const selectLang = (code: typeof lang) => {
    setLang(code);
    setOpen(false);
    // Return focus to the trigger so the container blurs cleanly
    containerRef.current?.querySelector("button")?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={handleBlur}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe size={13} className="text-muted-foreground" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline max-w-[80px] truncate">{current.nativeName}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Language options"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="glass-strong absolute end-0 top-full z-[100] mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl p-1.5 shadow-xl"
            dir="ltr"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={lang === l.code}
                /** Use onMouseDown + e.preventDefault() so the container's
                 *  onBlur fires AFTER we've already called setLang, not before. */
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents blur from firing before click
                  selectLang(l.code);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-ring ${
                  lang === l.code
                    ? "bg-primary/20 text-primary-glow"
                    : "text-muted-foreground hover:bg-primary/15 hover:text-foreground"
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{l.nativeName}</p>
                  <p className="truncate text-[10px] opacity-60">{l.label}</p>
                </div>
                {lang === l.code && (
                  <span className="shrink-0 text-primary-glow">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
