import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/lib/store";
import { Terminal } from "@/components/Terminal";
import { ArcadeMachine } from "@/components/ArcadeMachine";
import { AchievementGrid, ProgressionBar } from "@/components/Achievements";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jan Haber — Junior Unity Developer Portfolio" },
      {
        name: "description",
        content:
          "An interactive retro-arcade portfolio for a junior Unity game developer. Play, unlock skills, and explore projects.",
      },
      { property: "og:title", content: "Jan Haber — Interactive Portfolio" },
      {
        property: "og:description",
        content: "Step into the arcade. Play mini-games to unlock real developer skills.",
      },
    ],
  }),
  component: () => (
    <AppProvider>
      <Page />
    </AppProvider>
  ),
});

function Page() {
  const { t, store, start, enableRecruiter, setLang, reset } = useApp();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const onReset = () => {
    if (typeof window !== "undefined" && window.confirm(t.resetConfirm)) {
      reset();
    }
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="scanline-overlay" />
      <div className="vignette" />

      {/* HEADER */}
      <header className="relative z-10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <a href="#top" className="font-display text-sm text-glow-pink crt-flicker">
          ▮ JAHOO.SITE
        </a>
        <nav className="hidden md:flex items-center gap-5 font-display text-[10px]">
          <a href="#arcade" className="text-glow-cyan hover:text-glow-pink transition">
            PLAY
          </a>
          <a href="#achievements" className="text-glow-cyan hover:text-glow-pink transition">
            {t.achievements.toUpperCase()}
          </a>
          <a href="#projects" className="text-glow-cyan hover:text-glow-pink transition">
            {t.projects.toUpperCase()}
          </a>
          <a href="#about" className="text-glow-cyan hover:text-glow-pink transition">
            {t.aboutMe.toUpperCase()}
          </a>
          <a href="#contact" className="text-glow-cyan hover:text-glow-pink transition">
            {t.contact.toUpperCase()}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {(store.unlocked.length > 0 || store.recruiter) && (
            <button
              onClick={onReset}
              title={t.resetProgress}
              className="font-display text-[9px] px-2 py-1 border border-[var(--neon-pink)]/60 text-glow-pink hover:bg-[var(--neon-pink)] hover:text-background rounded-sm transition"
            >
              ↻ {t.resetProgress}
            </button>
          )}
          <LangSwitcher onChange={setLang} current={store.lang} />
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative px-4 pt-6 pb-16 text-center overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-72 opacity-40 pointer-events-none">
          <div className="grid-floor" />
        </div>
        <div className="relative z-10 fade-up">
          <div className="font-display text-[10px] text-glow-cyan tracking-widest mb-4">
            ◆ INSERT COIN · LOADING WORLD · 1987 ◆
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-glow-pink mb-4 crt-flicker">
            {t.heroTitle}
          </h1>
          <p className="font-display text-xs sm:text-sm text-glow-cyan mb-2">{t.heroSubtitle}</p>
          <p className="text-muted-foreground text-sm">{t.heroTagline}</p>

          {/* Mode selection */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-2xl mx-auto">
            <button
              onClick={() => {
                start();
                document.getElementById("arcade")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="neon-btn neon-btn-pink flex-1 group"
            >
              ▶ {t.arcadeMode}
              <div className="text-[8px] mt-1 opacity-70 normal-case tracking-normal">
                {t.arcadeModeDesc}
              </div>
            </button>
            <button
              onClick={() => {
                enableRecruiter();
                document.getElementById("achievements")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="neon-btn flex-1"
            >
              ⚡ {t.recruiterMode}
              <div className="text-[8px] mt-1 opacity-70 normal-case tracking-normal">
                {t.recruiterModeDesc}
              </div>
            </button>
          </div>

          {/* Terminal */}
          <div className="mt-10">{hydrated && <Terminal />}</div>
        </div>
      </section>

      {/* ARCADE HUB */}
      <section className="relative px-4 py-16">
        <SectionTitle eyebrow="◆ MAIN HUB ◆" title="THE ARCADE CABINET" />
        <ArcadeMachine />
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="relative px-4 sm:px-8 py-16 max-w-6xl mx-auto">
        <SectionTitle eyebrow={`★ ${t.skills} ★`} title={t.achievements.toUpperCase()} />
        <div className="mb-8">
          <ProgressionBar />
        </div>
        <AchievementGrid />
      </section>

      {/* PROJECTS */}
      <section id="projects" className="relative px-4 sm:px-8 py-16 max-w-6xl mx-auto">
        <SectionTitle eyebrow="◆ PORTFOLIO ◆" title={t.projects.toUpperCase()} />
        <div className="grid md:grid-cols-3 gap-5">
          {PROJECTS.map((p) => (
            <article key={p.title} className="glass pixel-corners p-5 hover-lift">
              <div className="text-3xl mb-3 neon-pulse">{p.icon}</div>
              <h3 className="font-display text-xs text-glow-pink mb-2">{p.title}</h3>
              <p className="text-sm text-foreground/80 mb-3">{p.desc[store.lang]}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tech.map((tch) => (
                  <span
                    key={tch}
                    className="text-[10px] font-display px-2 py-1 border border-[var(--neon-cyan)]/40 text-glow-cyan rounded-sm"
                  >
                    {tch}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative px-4 sm:px-8 py-16 max-w-3xl mx-auto text-center">
        <SectionTitle eyebrow="◆ PLAYER FILE ◆" title={t.aboutMe.toUpperCase()} />
        <div className="glass pixel-corners p-6 fade-up">
          <div className="text-5xl mb-4 float-y">🕹️</div>
          <p className="text-foreground/90 leading-relaxed">{t.aboutText}</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative px-4 sm:px-8 py-16 max-w-2xl mx-auto text-center">
        <SectionTitle eyebrow="◆ TRANSMISSION ◆" title={t.contact.toUpperCase()} />
        <div className="glass pixel-corners p-6">
          <p className="font-display text-xs text-glow-yellow mb-4 crt-flicker">{t.contactCta}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:hello@arcade.dev" className="neon-btn neon-btn-pink">
              ✉ {t.sendEmail}
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="neon-btn">
              ⌨ {t.viewGithub}
            </a>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 font-display text-[9px] text-muted-foreground">
        © {new Date().getFullYear()} ARCADE.DEV —{" "}
        <span className="text-glow-pink blink">PRESS START</span>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-8 fade-up">
      <div className="font-display text-[10px] text-glow-cyan tracking-widest mb-3">{eyebrow}</div>
      <h2 className="font-display text-2xl sm:text-3xl text-glow-pink">{title}</h2>
    </div>
  );
}

function LangSwitcher({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  const langs: Lang[] = ["en", "fr", "pl"];
  return (
    <div className="glass pixel-corners flex p-1 gap-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`font-display text-[10px] px-2 py-1 rounded-sm transition ${
            current === l
              ? "bg-[var(--neon-pink)] text-background"
              : "text-glow-cyan hover:text-glow-pink"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const PROJECTS = [
  {
    title: "NEON RUNNER",
    icon: "🏃",
    desc: {
      en: "An endless arcade runner built in Unity with custom shaders and pickup combos.",
      fr: "Un runner arcade infini en Unity avec shaders custom et combos.",
      pl: "Niekończący się arcade runner w Unity z własnymi shaderami.",
    },
    tech: ["Unity", "C#", "Shader Graph"],
  },
  {
    title: "PIXEL QUEST",
    icon: "⚔️",
    desc: {
      en: "Top-down pixel-art RPG prototype with dialog system and inventory.",
      fr: "Prototype RPG pixel-art top-down avec dialogues et inventaire.",
      pl: "Prototyp pixel-art RPG z dialogami i ekwipunkiem.",
    },
    tech: ["Unity", "C#", "Tilemap"],
  },
  {
    title: "HABIT TRACKER",
    icon: "📱",
    desc: {
      en: "Native Android habit tracker with streaks, reminders & widgets.",
      fr: "App Android de suivi d'habitudes avec streaks et widgets.",
      pl: "Natywna aplikacja Android do śledzenia nawyków.",
    },
    tech: ["Kotlin", "Android Studio"],
  },
  {
    title: "LEADERBOARD API",
    icon: "🏆",
    desc: {
      en: "NestJS REST API powering global game leaderboards with auth.",
      fr: "API REST NestJS pour leaderboards de jeu avec auth.",
      pl: "API REST w NestJS do rankingów gier z autoryzacją.",
    },
    tech: ["NestJS", "TypeScript", "Postgres"],
  },
  {
    title: "ARCADE.DEV",
    icon: "🕹️",
    desc: {
      en: "This site — a playable React portfolio with CRT aesthetics and i18n.",
      fr: "Ce site — un portfolio React jouable avec esthétique CRT et i18n.",
      pl: "Ta strona — grywalne portfolio React z efektem CRT.",
    },
    tech: ["React", "Tailwind", "TS"],
  },
  {
    title: "PORTFOLIO API",
    icon: "🛠️",
    desc: {
      en: "Symfony backend serving content and contact pipeline.",
      fr: "Backend Symfony servant contenu et pipeline contact.",
      pl: "Backend Symfony obsługujący treść i kontakt.",
    },
    tech: ["Symfony", "PHP", "Doctrine"],
  },
];
