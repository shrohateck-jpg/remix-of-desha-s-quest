import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface DeshaSaysProps {
  text: string;
  className?: string;
  speed?: number;
}

/** Speech bubble with a typing effect — DESHA's voice */
export function DeshaSays({ text, className = "", speed = 28 }: DeshaSaysProps) {
  const [shown, setShown] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setShown("");
    indexRef.current = 0;
    const id = setInterval(() => {
      indexRef.current += 1;
      setShown(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass relative rounded-2xl px-5 py-3.5 text-base leading-relaxed ${className}`}
      dir="rtl"
    >
      <span className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-t border-r border-[oklch(0.5_0.1_300/0.25)] bg-[oklch(0.22_0.055_298/0.55)]" aria-hidden />
      {shown}
      {shown.length < text.length && <span className="animate-pulse text-primary-glow">▌</span>}
    </motion.div>
  );
}
