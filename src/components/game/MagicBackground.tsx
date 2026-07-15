/** Ambient magic fog + floating particles, pure CSS, sits behind content */
export function MagicBackground({ enhanced = false }: { enhanced?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Base gradient blobs */}
      <div className="absolute -top-24 left-1/4 h-96 w-[42rem] rounded-full bg-primary/12 blur-3xl animate-fog" />
      <div
        className="absolute bottom-0 right-0 h-80 w-[36rem] rounded-full bg-accent/10 blur-3xl animate-fog"
        style={{ animationDelay: "-8s" }}
      />

      {enhanced && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-secondary/8 blur-3xl animate-fog"
            style={{ animationDelay: "-4s", animationDuration: "20s" }}
          />
          <div
            className="absolute -bottom-20 left-1/4 h-64 w-80 rounded-full bg-primary/8 blur-2xl animate-fog"
            style={{ animationDelay: "-12s", animationDuration: "18s" }}
          />
        </>
      )}

      {/* Sparkle particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary-glow/70 animate-sparkle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {enhanced &&
        EXTRA_PARTICLES.map((p, i) => (
          <span
            key={`e${i}`}
            className="absolute rounded-full bg-accent/60 animate-sparkle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
    </div>
  );
}

const PARTICLES = [
  { top: "12%", left: "8%",  size: 4, delay: "0s",    duration: "3.1s" },
  { top: "25%", left: "85%", size: 3, delay: "0.7s",  duration: "2.6s" },
  { top: "45%", left: "15%", size: 2, delay: "1.4s",  duration: "3.6s" },
  { top: "60%", left: "92%", size: 4, delay: "0.3s",  duration: "2.9s" },
  { top: "75%", left: "30%", size: 3, delay: "1.9s",  duration: "3.3s" },
  { top: "85%", left: "70%", size: 2, delay: "0.9s",  duration: "2.4s" },
  { top: "35%", left: "55%", size: 2, delay: "2.3s",  duration: "3.8s" },
  { top: "8%",  left: "45%", size: 3, delay: "1.1s",  duration: "2.8s" },
];

const EXTRA_PARTICLES = [
  { top: "18%", left: "32%", size: 2, delay: "0.5s",  duration: "4.1s" },
  { top: "52%", left: "68%", size: 3, delay: "1.7s",  duration: "3.0s" },
  { top: "68%", left: "12%", size: 2, delay: "2.9s",  duration: "2.7s" },
  { top: "88%", left: "50%", size: 3, delay: "0.2s",  duration: "3.5s" },
  { top: "42%", left: "78%", size: 2, delay: "1.3s",  duration: "4.4s" },
  { top: "5%",  left: "72%", size: 4, delay: "0.8s",  duration: "2.2s" },
];
