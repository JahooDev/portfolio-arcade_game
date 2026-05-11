import { useEffect, useRef, useState } from "react";
import { useApp, ACHIEVEMENTS } from "@/lib/store";

type Line = { type: "in" | "out"; text: string; color?: string };

export function Terminal() {
  const { t, store, enableRecruiter, unlock, setLang, reset } = useApp();
  const [lines, setLines] = useState<Line[]>([
    { type: "out", text: "ARCADE OS v2.0 — INITIALIZED", color: "text-glow-green" },
    { type: "out", text: "> user_role? (player / recruiter)" },
    { type: "out", text: "> type 'help' for commands", color: "text-glow-cyan" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999 });
  }, [lines]);

  const out = (text: string, color?: string) => setLines((l) => [...l, { type: "out", text, color }]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((l) => [...l, { type: "in", text: raw }]);
    if (!cmd) return;
    if (cmd === "help") {
      out("─── AVAILABLE COMMANDS ───", "text-glow-yellow");
      out("recruiter   unlock showcase mode");
      out("player      arcade greeting");
      out("play        jump to arcade cabinet");
      out("status      show progression");
      out("reset       wipe progress & exit recruiter mode");
      out("unlock-all  cheat: unlock everything");
      out("whoami      session info");
      out("lang xx     en | fr | pl");
      out("clear       clear screen");
    } else if (cmd === "recruiter") {
      out("ACCESS GRANTED ✔", "text-glow-green");
      out("✔ Showcase Mode unlocked");
      out("✔ Achievements available");
      out("✔ Games optional");
      enableRecruiter();
    } else if (cmd === "player") {
      out("Welcome, Player One. Insert coin and press START.", "text-glow-pink");
    } else if (cmd === "play") {
      out("Heading to the arcade cabinet…", "text-glow-cyan");
      document.getElementById("arcade")?.scrollIntoView({ behavior: "smooth" });
    } else if (cmd === "status") {
      const pct = Math.round((store.unlocked.length / ACHIEVEMENTS.length) * 100);
      out("─── PLAYER STATUS ───", "text-glow-yellow");
      out(`mode      : ${store.recruiter ? "RECRUITER" : "PLAYER"}`, "text-glow-cyan");
      out(`language  : ${store.lang.toUpperCase()}`);
      out(`unlocked  : ${store.unlocked.length}/${ACHIEVEMENTS.length}  (${pct}%)`);
      const locked = ACHIEVEMENTS.filter((a) => !store.unlocked.includes(a.id)).map((a) => a.title);
      out(`pending   : ${locked.length ? locked.join(", ") : "— all unlocked —"}`);
    } else if (cmd === "reset") {
      reset();
      out("✔ progress wiped — fresh start", "text-glow-green");
      out("✔ recruiter mode disabled");
    } else if (cmd === "unlock-all") {
      ACHIEVEMENTS.forEach((a) => unlock(a.id));
      out("All achievements unlocked.", "text-glow-yellow");
    } else if (cmd === "whoami") {
      out(`> player(lang=${store.lang}, unlocked=${store.unlocked.length}/${ACHIEVEMENTS.length}, recruiter=${store.recruiter})`);
    } else if (cmd.startsWith("lang ")) {
      const l = cmd.split(" ")[1];
      if (l === "en" || l === "fr" || l === "pl") {
        setLang(l);
        out(`language → ${l.toUpperCase()}`, "text-glow-cyan");
      } else out("usage: lang en|fr|pl");
    } else if (cmd === "clear") {
      setLines([]);
    } else {
      out(`unknown command: ${cmd} — try 'help'`, "text-glow-pink");
    }
  };

  return (
    <div className="glass pixel-corners p-3 sm:p-4 max-w-3xl mx-auto crt-flicker">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--neon-yellow)" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--neon-green)" }} />
        <span className="ml-2 font-display text-[10px] text-glow-cyan">arcade-terminal ~ /home</span>
        <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">{t.terminalHint}</span>
      </div>
      <div ref={scrollRef} className="bg-black/60 rounded-md p-3 h-44 overflow-auto font-mono-retro text-lg leading-tight">
        {lines.map((ln, i) => (
          <div key={i} className={ln.color ?? "text-glow-green"}>
            {ln.type === "in" ? <span className="text-glow-pink">{"> "}{ln.text}</span> : ln.text}
          </div>
        ))}
        <form
          onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }}
          className="flex items-center gap-1 mt-1"
        >
          <span className="text-glow-pink">{">"}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-glow-green font-mono-retro text-lg"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <span className="text-glow-green blink">▮</span>
        </form>
      </div>
    </div>
  );
}
