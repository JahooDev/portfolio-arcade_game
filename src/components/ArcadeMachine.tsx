import { useState } from "react";
import { ACHIEVEMENTS, useApp } from "@/lib/store";
import { TicTacToe, Memory, Snake, Breakout, WhacABug, Reaction } from "./MiniGames";

type GameKey = "tictactoe" | "memory" | "snake" | "breakout" | "whack" | "reaction";

const GAME_REWARDS: Record<GameKey, string[]> = {
  tictactoe: ["unity", "csharp"],
  memory: ["react", "tailwind", "html", "css"],
  snake: ["js", "ts"],
  breakout: ["nestjs", "symfony", "php"],
  whack: ["android", "kotlin", "java"],
  reaction: ["swiftui"],
};

const GAME_ICONS: Record<GameKey, string> = {
  tictactoe: "⊞",
  memory: "🧠",
  snake: "🐍",
  breakout: "🧱",
  whack: "🐛",
  reaction: "⚡",
};

export function ArcadeMachine() {
  const { t, store, unlock } = useApp();
  const [game, setGame] = useState<GameKey | null>(null);
  const [reward, setReward] = useState<string | null>(null);

  const onWin = () => {
    if (!game) return;
    const candidates = GAME_REWARDS[game].filter((id) => !store.unlocked.includes(id));
    const id = candidates[0] ?? GAME_REWARDS[game][0];
    unlock(id);
    setReward(id);
    setTimeout(() => setReward(null), 2400);
  };

  return (
    <div id="arcade" className="relative mx-auto w-full max-w-[640px] px-2 sm:px-0">
      {/* Cabinet */}
      <div className="cabinet relative">
        {/* Side speakers */}
        <div className="cab-speaker cab-speaker-left" aria-hidden />
        <div className="cab-speaker cab-speaker-right" aria-hidden />

        {/* Marquee header */}
        <div className="cab-marquee">
          <div className="cab-marquee-inner">
            <div className="font-display text-[11px] sm:text-sm text-glow-pink crt-flicker tracking-widest">★ ARCADE.DEV ★</div>
          </div>
        </div>

        {/* Bezel + Screen */}
        <div className="cab-bezel">
          <div className="crt-screen crt-scanlines cab-screen">
            {reward ? (
              <RewardSplash id={reward} />
            ) : !game ? (
              <div className="text-center w-full fade-up">
                <div className="font-display text-[10px] sm:text-xs text-glow-yellow mb-3">★ {t.selectGame} ★</div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {(Object.keys(GAME_REWARDS) as GameKey[]).map((k) => (
                    <GameBtn key={k} icon={GAME_ICONS[k]} label={t.games[k]} onClick={() => setGame(k)} />
                  ))}
                </div>
                <div className="mt-4 text-[10px] text-muted-foreground blink">{t.insertCoin}</div>
              </div>
            ) : (
              <div className="w-full fade-up flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="font-display text-[10px] text-glow-cyan">{t.games[game]}</div>
                  <button onClick={() => setGame(null)} className="font-display text-[9px] text-glow-pink hover:underline">
                    ← {t.backToHub}
                  </button>
                </div>
                {game === "tictactoe" && <TicTacToe onWin={onWin} />}
                {game === "memory" && <Memory onWin={onWin} />}
                {game === "snake" && <Snake onWin={onWin} />}
                {game === "breakout" && <Breakout onWin={onWin} />}
                {game === "whack" && <WhacABug onWin={onWin} />}
                {game === "reaction" && <Reaction onWin={onWin} />}
              </div>
            )}
          </div>
        </div>

        {/* Control panel */}
        <div className="cab-controls">
          <div className="joystick" aria-hidden>
            <div className="joystick-shaft" />
            <div className="joystick-ball" />
            <div className="joystick-base" />
          </div>
          <div className="cab-buttons">
            {(["pink", "yellow", "cyan", "green"] as const).map((c) => (
              <div key={c} className="arcade-btn" style={{ background: `var(--neon-${c})`, boxShadow: `0 0 14px var(--neon-${c}), inset 0 -3px 0 oklch(0 0 0 / 0.4)` }} />
            ))}
          </div>
        </div>

        {/* Coin slot */}
        <div className="cab-coin">
          <div className="coin-slot" />
          <div className="font-display text-[8px] text-glow-yellow mt-1 tracking-widest">INSERT COIN</div>
        </div>
      </div>

      {/* Stand */}
      <div className="cab-stand" />
      <div className="cab-shadow" />
    </div>
  );
}

function GameBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="neon-btn neon-btn-pink w-full flex items-center justify-center gap-2 py-2 text-[10px]">
      <span className="text-base">{icon}</span> {label}
    </button>
  );
}

function RewardSplash({ id }: { id: string }) {
  const { t } = useApp();
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  return (
    <div className="text-center scale-in">
      <div className="font-display text-[10px] text-glow-yellow mb-2">★ {t.rewardUnlocked} ★</div>
      <div className="text-6xl mb-3 neon-pulse">{ach?.icon}</div>
      <div className="font-display text-sm text-glow-pink">{ach?.title}</div>
      <div className="text-xs mt-1 text-glow-cyan">{ach?.category}</div>
      <div className="mt-4 text-[10px] text-muted-foreground blink">{t.completed}</div>
    </div>
  );
}
