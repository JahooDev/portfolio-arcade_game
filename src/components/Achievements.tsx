import { useEffect, useState } from "react";
import { ACHIEVEMENTS, useApp, type Achievement } from "@/lib/store";

const colorMap: Record<Achievement["color"], { glow: string; border: string; }> = {
  pink:   { glow: "text-glow-pink",   border: "border-neon-pink" },
  cyan:   { glow: "text-glow-cyan",   border: "border-neon-cyan" },
  yellow: { glow: "text-glow-yellow", border: "border-neon-pink" },
  green:  { glow: "text-glow-green",  border: "border-neon-cyan" },
  purple: { glow: "text-glow-pink",   border: "border-neon-pink" },
};

export function AchievementGrid() {
  const { store, t } = useApp();
  const [flipped, setFlipped] = useState<string | null>(null);
  const [recent, setRecent] = useState<string | null>(null);

  // detect newly unlocked
  useEffect(() => {
    const last = store.unlocked[store.unlocked.length - 1];
    if (last) {
      setRecent(last);
      const id = setTimeout(() => setRecent(null), 1200);
      return () => clearTimeout(id);
    }
  }, [store.unlocked.length]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {ACHIEVEMENTS.map((a) => {
        const isUnlocked = store.unlocked.includes(a.id);
        const isFlipped = flipped === a.id;
        const c = colorMap[a.color];
        const desc = a.desc[store.lang];
        const exp = a.experience[store.lang];
        return (
          <div key={a.id} className={`card-flip h-56 ${isFlipped ? "flipped" : ""} ${recent === a.id ? "scale-in" : ""}`}>
            <div className="card-flip-inner h-full">
              {/* FRONT */}
              <button
                onClick={() => isUnlocked && setFlipped(isFlipped ? null : a.id)}
                disabled={!isUnlocked}
                className={`card-face absolute inset-0 glass pixel-corners p-4 flex flex-col items-center justify-center text-center hover-lift ${
                  !isUnlocked ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="text-4xl mb-2 neon-pulse">{isUnlocked ? a.icon : "🔒"}</div>
                <div className={`font-display text-xs ${isUnlocked ? c.glow : "text-muted-foreground"}`}>{a.title}</div>
                <div className="text-[10px] mt-1 text-muted-foreground uppercase tracking-widest">{a.category}</div>
                <div className="mt-3 text-[10px] font-display">
                  {isUnlocked ? (
                    <span className="text-glow-green">★ {t.unlocked}</span>
                  ) : (
                    <span className="text-muted-foreground">{t.locked}</span>
                  )}
                </div>
                {isUnlocked && <div className="text-[9px] mt-2 text-muted-foreground">{t.flipCard}</div>}
              </button>
              {/* BACK */}
              <div
                onClick={() => setFlipped(null)}
                className={`card-face card-back absolute inset-0 glass pixel-corners p-3 cursor-pointer overflow-auto ${c.border}`}
              >
                <div className={`font-display text-[11px] mb-1 ${c.glow}`}>{a.title}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2">{a.category}</div>
                <div className="text-[10px] font-display text-glow-yellow">{t.description}</div>
                <p className="text-xs text-foreground/90 mb-2 leading-snug">{desc}</p>
                <div className="text-[10px] font-display text-glow-yellow">{t.experience}</div>
                <p className="text-xs text-foreground/90 mb-2 leading-snug">{exp}</p>
                <div className="text-[10px] font-display text-glow-yellow">{t.relatedProjects}</div>
                <p className="text-xs text-foreground/90 leading-snug">{a.projects.join(" · ")}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressionBar() {
  const { store, t } = useApp();
  const total = ACHIEVEMENTS.length;
  const got = store.unlocked.length;
  const pct = Math.round((got / total) * 100);
  const blocks = 20;
  const filled = Math.round((pct / 100) * blocks);
  return (
    <div className="glass pixel-corners p-4 max-w-2xl mx-auto">
      <div className="flex justify-between font-display text-[10px] mb-2">
        <span className="text-glow-pink">{t.progression}</span>
        <span className="text-glow-cyan">{got}/{total} {t.achievements}</span>
      </div>
      <div className="font-mono-retro text-xl tracking-tight text-glow-green">
        {"█".repeat(filled)}{"░".repeat(blocks - filled)} {pct}%
      </div>
    </div>
  );
}
