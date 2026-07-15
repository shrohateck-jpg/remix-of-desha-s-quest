import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`glass flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:text-foreground ${className ?? ""}`}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </motion.div>
    </motion.button>
  );
}
