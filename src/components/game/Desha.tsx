import { motion } from "framer-motion";
import deshaIdle from "@/assets/desha/idle.png";
import deshaCelebrating from "@/assets/desha/celebrating.png";
import deshaThinking from "@/assets/desha/thinking.png";
import deshaDisappointed from "@/assets/desha/disappointed.png";

export type DeshaExpression = "idle" | "celebrating" | "thinking" | "disappointed";

const ART: Record<DeshaExpression, string> = {
  idle: deshaIdle,
  celebrating: deshaCelebrating,
  thinking: deshaThinking,
  disappointed: deshaDisappointed,
};

const SIZES = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-44 h-44 md:w-56 md:h-56",
  xl: "w-56 h-56 md:w-72 md:h-72",
} as const;

interface DeshaProps {
  expression?: DeshaExpression;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Desha({ expression = "idle", size = "lg", className = "" }: DeshaProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* magic glow behind DESHA */}
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" aria-hidden />
      <motion.img
        key={expression}
        src={ART[expression]}
        alt="ديشا — الكائن الشرير اللطيف"
        className={`${SIZES[size]} animate-desha-float object-contain drop-shadow-[0_0_25px_oklch(0.58_0.26_300/0.5)] select-none`}
        draggable={false}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      />
      {/* sparkles */}
      <span className="absolute top-2 -right-1 h-2 w-2 rounded-full bg-primary-glow animate-sparkle" aria-hidden />
      <span
        className="absolute bottom-6 -left-2 h-1.5 w-1.5 rounded-full bg-accent animate-sparkle"
        style={{ animationDelay: "0.9s" }}
        aria-hidden
      />
      <span
        className="absolute top-10 left-0 h-1 w-1 rounded-full bg-gold animate-sparkle"
        style={{ animationDelay: "1.6s" }}
        aria-hidden
      />
    </div>
  );
}
