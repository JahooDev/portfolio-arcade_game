import { useEffect, useRef, useState } from "react";

/* ---------------- Tic Tac Toe ---------------- */
export function TicTacToe({ onWin }: { onWin: () => void }) {
  const [b, setB] = useState<(null | "X" | "O")[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [done, setDone] = useState<string | null>(null);

  const winner = (cells: typeof b) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) if (cells[a] && cells[a] === cells[c] && cells[a] === cells[d]) return cells[a];
    if (cells.every(Boolean)) return "draw";
    return null;
  };

  const play = (i: number) => {
    if (b[i] || done) return;
    const next = [...b]; next[i] = turn;
    setB(next);
    const w = winner(next);
    if (w) { setDone(w); onWin(); return; }
    setTurn(turn === "X" ? "O" : "X");
  };

  useEffect(() => {
    if (turn !== "O" || done) return;
    const empty = b.map((v, i) => v ? -1 : i).filter((i) => i >= 0);
    if (!empty.length) return;
    const move = empty[Math.floor(Math.random() * empty.length)];
    const id = setTimeout(() => play(move), 400);
    return () => clearTimeout(id);
  }, [turn, b, done]);

  const reset = () => { setB(Array(9).fill(null)); setTurn("X"); setDone(null); };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-3 gap-2">
        {b.map((v, i) => (
          <button key={i} onClick={() => play(i)}
            className="w-16 h-16 sm:w-20 sm:h-20 glass pixel-corners font-display text-2xl text-glow-cyan hover:bg-white/5 transition active:scale-95">
            {v ?? ""}
          </button>
        ))}
      </div>
      {done && (
        <div className="text-glow-pink font-display text-sm fade-up">
          {done === "draw" ? "DRAW" : `${done} WINS`} —{" "}
          <button onClick={reset} className="underline">replay</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Memory ---------------- */
const EMOJIS = ["🎮", "👾", "🕹️", "💾", "🪙", "⭐"];
export function Memory({ onWin }: { onWin: () => void }) {
  const [cards, setCards] = useState<{ v: string; flipped: boolean; matched: boolean }[]>([]);
  const [pick, setPick] = useState<number[]>([]);

  useEffect(() => {
    const deck = [...EMOJIS, ...EMOJIS]
      .map((v) => ({ v, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
  }, []);

  useEffect(() => {
    if (pick.length !== 2) return;
    const [a, b] = pick;
    const next = [...cards];
    if (cards[a].v === cards[b].v) {
      next[a].matched = true; next[b].matched = true;
      setCards(next); setPick([]);
      if (next.every((c) => c.matched)) setTimeout(onWin, 400);
    } else {
      setTimeout(() => {
        next[a].flipped = false; next[b].flipped = false;
        setCards(next); setPick([]);
      }, 700);
    }
  }, [pick]);

  const flip = (i: number) => {
    if (cards[i].flipped || cards[i].matched || pick.length === 2) return;
    const next = [...cards]; next[i].flipped = true;
    setCards(next); setPick([...pick, i]);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {cards.map((c, i) => (
        <button key={i} onClick={() => flip(i)}
          className={`w-14 h-14 sm:w-16 sm:h-16 pixel-corners flex items-center justify-center text-2xl transition active:scale-95 ${
            c.flipped || c.matched ? "bg-gradient-neon" : "glass"
          }`}>
          {(c.flipped || c.matched) && c.v}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Mini Snake (with touch D-pad + swipe) ---------------- */
export function Snake({ onWin }: { onWin: () => void }) {
  const SIZE = 12, GOAL = 5;
  const [snake, setSnake] = useState<[number, number][]>([[5, 5]]);
  const [dir, setDir] = useState<[number, number]>([1, 0]);
  const [food, setFood] = useState<[number, number]>([8, 5]);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const turn = (d: [number, number]) => {
    const cur = dirRef.current;
    if (d[0] === -cur[0] && d[1] === -cur[1]) return;
    setDir(d);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      };
      const d = map[e.key];
      if (d) { e.preventDefault(); turn(d); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // swipe on board
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) turn([dx > 0 ? 1 : -1, 0]);
    else turn([0, dy > 0 ? 1 : -1]);
    touch.current = null;
  };

  useEffect(() => {
    if (dead || won) return;
    const id = setInterval(() => {
      setSnake((s) => {
        const d = dirRef.current;
        const head: [number, number] = [s[0][0] + d[0], s[0][1] + d[1]];
        if (head[0] < 0 || head[0] >= SIZE || head[1] < 0 || head[1] >= SIZE
          || s.some(([x, y]) => x === head[0] && y === head[1])) {
          setDead(true); return s;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        const next = [head, ...s];
        if (!ate) next.pop();
        else {
          setScore((sc) => {
            const ns = sc + 1;
            if (ns >= GOAL) { setWon(true); setTimeout(onWin, 300); }
            return ns;
          });
          let nf: [number, number];
          do { nf = [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)]; }
          while (next.some(([x, y]) => x === nf[0] && y === nf[1]));
          setFood(nf);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [food, dead, won]);

  const restart = () => { setSnake([[5,5]]); setDir([1,0]); setFood([8,5]); setScore(0); setDead(false); setWon(false); };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-display text-xs text-glow-yellow">SCORE {score}/{GOAL}</div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        className="grid bg-black/60 p-2 pixel-corners touch-none select-none"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 14px)`, gap: 1 }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const x = i % SIZE, y = Math.floor(i / SIZE);
          const isSnake = snake.some(([sx, sy]) => sx === x && sy === y);
          const isHead = snake[0][0] === x && snake[0][1] === y;
          const isFood = food[0] === x && food[1] === y;
          return (
            <div key={i} className="w-3.5 h-3.5"
              style={{
                background: isHead ? "var(--neon-pink)"
                  : isSnake ? "var(--neon-cyan)"
                  : isFood ? "var(--neon-yellow)"
                  : "oklch(0.18 0.05 280)",
                boxShadow: isFood ? "0 0 8px var(--neon-yellow)" : isHead ? "0 0 6px var(--neon-pink)" : undefined,
              }} />
          );
        })}
      </div>

      {/* On-screen D-pad (touch friendly) */}
      <div className="dpad mt-1">
        <button aria-label="up" onClick={() => turn([0, -1])} className="dpad-btn dpad-up">▲</button>
        <button aria-label="left" onClick={() => turn([-1, 0])} className="dpad-btn dpad-left">◀</button>
        <button aria-label="right" onClick={() => turn([1, 0])} className="dpad-btn dpad-right">▶</button>
        <button aria-label="down" onClick={() => turn([0, 1])} className="dpad-btn dpad-down">▼</button>
      </div>

      {dead && (
        <button onClick={restart} className="neon-btn neon-btn-pink">Game Over — Retry</button>
      )}
      <div className="text-[10px] text-muted-foreground">Swipe / D-pad / Arrows</div>
    </div>
  );
}

/* ---------------- Brick Breaker ---------------- */
export function Breakout({ onWin }: { onWin: () => void }) {
  const W = 240, H = 280, PADDLE_W = 56, PADDLE_H = 6, BALL = 5;
  const ROWS = 3, COLS = 6, BRICK_W = 36, BRICK_H = 12, BRICK_GAP = 2, BRICK_TOP = 16;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paddleX, setPaddleX] = useState(W / 2 - PADDLE_W / 2);
  const paddleRef = useRef(paddleX);
  paddleRef.current = paddleX;
  const [ball, setBall] = useState({ x: W / 2, y: H - 30, vx: 2.2, vy: -2.4 });
  const [bricks, setBricks] = useState(() =>
    Array.from({ length: ROWS * COLS }, () => true)
  );
  const [done, setDone] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (done) return;
    let raf: number;
    const tick = () => {
      setBall((b) => {
        let { x, y, vx, vy } = b;
        x += vx; y += vy;
        if (x <= BALL || x >= W - BALL) vx = -vx;
        if (y <= BALL) vy = -vy;
        // paddle
        if (y >= H - 14 && y <= H - 6 && x >= paddleRef.current && x <= paddleRef.current + PADDLE_W) {
          vy = -Math.abs(vy);
          const hit = (x - paddleRef.current) / PADDLE_W - 0.5;
          vx = hit * 4;
        }
        // bricks
        setBricks((br) => {
          let changed = false;
          const next = [...br];
          for (let i = 0; i < next.length; i++) {
            if (!next[i]) continue;
            const r = Math.floor(i / COLS), c = i % COLS;
            const bx = c * (BRICK_W + BRICK_GAP) + (W - COLS * (BRICK_W + BRICK_GAP)) / 2;
            const by = BRICK_TOP + r * (BRICK_H + BRICK_GAP);
            if (x >= bx && x <= bx + BRICK_W && y >= by && y <= by + BRICK_H) {
              next[i] = false; vy = -vy; changed = true; break;
            }
          }
          if (changed && next.every((v) => !v)) {
            setDone("win"); setTimeout(onWin, 300);
          }
          return changed ? next : br;
        });
        if (y > H) { setDone("lose"); }
        return { x, y, vx, vy };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  const move = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = ((clientX - rect.left) / rect.width) * W;
    setPaddleX(Math.max(0, Math.min(W - PADDLE_W, rel - PADDLE_W / 2)));
  };

  const restart = () => {
    setBall({ x: W / 2, y: H - 30, vx: 2.2, vy: -2.4 });
    setBricks(Array.from({ length: ROWS * COLS }, () => true));
    setDone(null);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div ref={wrapRef}
        onMouseMove={(e) => move(e.clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchStart={(e) => move(e.touches[0].clientX)}
        className="relative bg-black/60 pixel-corners touch-none"
        style={{ width: "min(90vw, 240px)", aspectRatio: `${W}/${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full">
          {bricks.map((on, i) => {
            if (!on) return null;
            const r = Math.floor(i / COLS), c = i % COLS;
            const bx = c * (BRICK_W + BRICK_GAP) + (W - COLS * (BRICK_W + BRICK_GAP)) / 2;
            const by = BRICK_TOP + r * (BRICK_H + BRICK_GAP);
            const colors = ["var(--neon-pink)", "var(--neon-yellow)", "var(--neon-cyan)"];
            return <rect key={i} x={bx} y={by} width={BRICK_W} height={BRICK_H} fill={colors[r]} opacity={0.9} />;
          })}
          <rect x={paddleX} y={H - 12} width={PADDLE_W} height={PADDLE_H} fill="var(--neon-cyan)" />
          <circle cx={ball.x} cy={ball.y} r={BALL} fill="var(--neon-pink)" />
        </svg>
      </div>
      {done === "lose" && <button onClick={restart} className="neon-btn neon-btn-pink">Retry</button>}
      <div className="text-[10px] text-muted-foreground">Drag / Move to control paddle</div>
    </div>
  );
}

/* ---------------- Whac-a-Bug ---------------- */
export function WhacABug({ onWin }: { onWin: () => void }) {
  const HOLES = 9, GOAL = 8, DURATION = 20;
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [done, setDone] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setActive(Math.floor(Math.random() * HOLES));
    }, 750);
    const c = setInterval(() => {
      setTime((s) => {
        if (s <= 1) { setDone((d) => d ?? "lose"); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, [done]);

  const hit = (i: number) => {
    if (done || active !== i) return;
    setActive(null);
    setScore((s) => {
      const ns = s + 1;
      if (ns >= GOAL) { setDone("win"); setTimeout(onWin, 300); }
      return ns;
    });
  };

  const restart = () => { setScore(0); setTime(DURATION); setDone(null); setActive(null); };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4 font-display text-xs">
        <span className="text-glow-yellow">SCORE {score}/{GOAL}</span>
        <span className="text-glow-cyan">TIME {time}s</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: HOLES }).map((_, i) => (
          <button key={i} onClick={() => hit(i)}
            className={`w-16 h-16 sm:w-20 sm:h-20 pixel-corners flex items-center justify-center text-3xl transition active:scale-90 ${
              active === i ? "bg-gradient-neon scale-110" : "bg-black/60"
            }`}>
            {active === i ? "🐛" : "·"}
          </button>
        ))}
      </div>
      {done === "lose" && <button onClick={restart} className="neon-btn neon-btn-pink">Retry</button>}
    </div>
  );
}

/* ---------------- Reaction Test ---------------- */
export function Reaction({ onWin }: { onWin: () => void }) {
  type Phase = "idle" | "wait" | "go" | "early" | "result";
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const startRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ROUNDS = 3, THRESHOLD = 600;

  const begin = () => {
    setPhase("wait");
    timer.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
    }, 900 + Math.random() * 1800);
  };

  const click = () => {
    if (phase === "idle" || phase === "result" || phase === "early") {
      setRound(0); setTimes([]); begin(); return;
    }
    if (phase === "wait") {
      if (timer.current) clearTimeout(timer.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const dt = performance.now() - startRef.current;
      const nextTimes = [...times, dt];
      const nextRound = round + 1;
      setTimes(nextTimes);
      if (nextRound >= ROUNDS) {
        setRound(nextRound);
        setPhase("result");
        const avg = nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length;
        if (avg < THRESHOLD) setTimeout(onWin, 400);
      } else {
        setRound(nextRound);
        begin();
      }
    }
  };

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const bg =
    phase === "go" ? "bg-[var(--neon-green)]" :
    phase === "wait" ? "bg-[oklch(0.4_0.2_20)]" :
    phase === "early" ? "bg-[var(--neon-pink)]" :
    "bg-black/60";
  const label =
    phase === "idle" ? "TAP TO START" :
    phase === "wait" ? "WAIT…" :
    phase === "go" ? "TAP NOW!" :
    phase === "early" ? "TOO EARLY — TAP TO RETRY" :
    avg < THRESHOLD ? `★ AVG ${avg}ms ★` : `AVG ${avg}ms — TAP TO RETRY`;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="font-display text-xs text-glow-yellow">
        ROUND {Math.min(round + (phase === "go" || phase === "wait" ? 1 : 0), ROUNDS)}/{ROUNDS}
      </div>
      <button onClick={click}
        className={`w-full max-w-xs h-44 pixel-corners font-display text-sm text-glow-cyan transition ${bg} active:scale-95`}>
        {label}
      </button>
      {phase === "result" && (
        <div className="text-[10px] text-muted-foreground">
          Times: {times.map((t) => Math.round(t)).join(" · ")} ms
        </div>
      )}
    </div>
  );
}
