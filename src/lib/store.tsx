import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang, type Dict } from "./i18n";

export type Achievement = {
  id: string;
  title: string;
  category: "Game Dev" | "Mobile" | "Frontend" | "Backend" | "Language";
  icon: string;
  color: "pink" | "cyan" | "yellow" | "green" | "purple";
  desc: { en: string; fr: string; pl: string };
  experience: { en: string; fr: string; pl: string };
  projects: string[];
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "unity", title: "Unity", category: "Game Dev", icon: "🎮", color: "pink",
    desc: { en: "Build 2D/3D games & interactive experiences with Unity Engine.", fr: "Création de jeux 2D/3D et expériences interactives avec Unity.", pl: "Tworzenie gier 2D/3D i interaktywnych doświadczeń w Unity." },
    experience: { en: "Personal projects, game jams, custom shaders & gameplay systems.", fr: "Projets personnels, game jams, shaders et systèmes de gameplay.", pl: "Projekty osobiste, game jams, własne shadery i systemy gry." },
    projects: ["Neon Runner", "Pixel Quest"] },
  { id: "csharp", title: "C#", category: "Language", icon: "♯", color: "purple",
    desc: { en: "OOP, async, LINQ, Unity scripting & .NET fundamentals.", fr: "POO, async, LINQ, scripting Unity et bases .NET.", pl: "OOP, async, LINQ, skrypty Unity i podstawy .NET." },
    experience: { en: "Daily-driver language for Unity gameplay & tooling.", fr: "Langage du quotidien pour Unity gameplay & tooling.", pl: "Codzienny język dla Unity gameplay i narzędzi." },
    projects: ["Unity gameplay systems"] },
  { id: "android", title: "Android Studio", category: "Mobile", icon: "🤖", color: "green",
    desc: { en: "Native Android apps with Kotlin & Java in Android Studio.", fr: "Apps Android natives avec Kotlin & Java.", pl: "Natywne aplikacje Android z Kotlin & Java." },
    experience: { en: "Built mobile UIs, sensors integration, lifecycle management.", fr: "UI mobiles, capteurs, gestion du cycle de vie.", pl: "UI mobilne, integracja z sensorami, lifecycle." },
    projects: ["Habit tracker app"] },
  { id: "swiftui", title: "SwiftUI", category: "Mobile", icon: "", color: "cyan",
    desc: { en: "Declarative iOS UI with SwiftUI & Combine.", fr: "UI iOS déclarative avec SwiftUI & Combine.", pl: "Deklaratywne UI iOS z SwiftUI & Combine." },
    experience: { en: "Small iOS utilities & prototypes.", fr: "Petits utilitaires & prototypes iOS.", pl: "Małe narzędzia i prototypy iOS." },
    projects: ["iOS prototypes"] },
  { id: "react", title: "React", category: "Frontend", icon: "⚛", color: "cyan",
    desc: { en: "Component-driven UIs, hooks, state, suspense.", fr: "UIs basées composants, hooks, état, suspense.", pl: "UI komponentowe, hooks, state, suspense." },
    experience: { en: "Built this portfolio + several SPAs and dashboards.", fr: "Ce portfolio + plusieurs SPAs et dashboards.", pl: "To portfolio + SPA i dashboardy." },
    projects: ["This portfolio", "Dashboards"] },
  { id: "tailwind", title: "Tailwind CSS", category: "Frontend", icon: "🎨", color: "cyan",
    desc: { en: "Utility-first styling, design systems, responsive UIs.", fr: "Utility-first, design systems, UIs responsive.", pl: "Utility-first, design systemy, responsywne UI." },
    experience: { en: "Design tokens, custom themes, animation utilities.", fr: "Design tokens, thèmes custom, utilitaires d'animation.", pl: "Design tokens, własne motywy, animacje." },
    projects: ["Portfolio design system"] },
  { id: "nestjs", title: "NestJS", category: "Backend", icon: "🪺", color: "pink",
    desc: { en: "Modular Node.js APIs with TypeScript & decorators.", fr: "APIs Node.js modulaires en TypeScript.", pl: "Modularne API Node.js w TypeScript." },
    experience: { en: "REST APIs, auth, database integration.", fr: "APIs REST, auth, BDD.", pl: "API REST, auth, bazy danych." },
    projects: ["Game leaderboard API"] },
  { id: "symfony", title: "Symfony", category: "Backend", icon: "🎼", color: "purple",
    desc: { en: "PHP framework for robust web apps & APIs.", fr: "Framework PHP pour apps web robustes.", pl: "Framework PHP do solidnych aplikacji." },
    experience: { en: "School & freelance projects with Doctrine ORM.", fr: "Projets école & freelance avec Doctrine.", pl: "Projekty szkolne i freelance z Doctrine." },
    projects: ["Web platform"] },
  { id: "java", title: "Java", category: "Language", icon: "☕", color: "yellow",
    desc: { en: "JVM language for Android & backend services.", fr: "Langage JVM pour Android & backend.", pl: "Język JVM dla Androida i backendu." },
    experience: { en: "Android development & academic CS work.", fr: "Développement Android & travaux académiques.", pl: "Android i prace akademickie." },
    projects: ["Android apps"] },
  { id: "kotlin", title: "Kotlin", category: "Language", icon: "🟣", color: "purple",
    desc: { en: "Modern, expressive language for Android.", fr: "Langage moderne et expressif pour Android.", pl: "Nowoczesny język dla Androida." },
    experience: { en: "Preferred for new Android features.", fr: "Préféré pour nouvelles features Android.", pl: "Preferowany dla nowych funkcji Android." },
    projects: ["Android features"] },
  { id: "php", title: "PHP", category: "Language", icon: "🐘", color: "purple",
    desc: { en: "Server-side scripting, Symfony backbone.", fr: "Scripting serveur, base de Symfony.", pl: "Server-side, podstawa Symfony." },
    experience: { en: "Used in Symfony APIs & legacy support.", fr: "Utilisé dans Symfony et legacy.", pl: "Używany w Symfony i legacy." },
    projects: ["Symfony APIs"] },
  { id: "js", title: "JavaScript", category: "Language", icon: "🟨", color: "yellow",
    desc: { en: "ES2023+, async, the language of the web.", fr: "ES2023+, async, le langage du web.", pl: "ES2023+, async, język web." },
    experience: { en: "Daily — frontend & Node tooling.", fr: "Quotidien — frontend & Node.", pl: "Codziennie — frontend i Node." },
    projects: ["Everywhere"] },
  { id: "ts", title: "TypeScript", category: "Language", icon: "🔷", color: "cyan",
    desc: { en: "Typed JavaScript, generics, strict mode.", fr: "JavaScript typé, génériques, strict.", pl: "Typowany JS, generyki, strict." },
    experience: { en: "Default for any new JS project.", fr: "Par défaut pour tout nouveau projet.", pl: "Domyślny dla nowych projektów." },
    projects: ["This portfolio"] },
  { id: "html", title: "HTML", category: "Frontend", icon: "📄", color: "pink",
    desc: { en: "Semantic, accessible markup.", fr: "Markup sémantique et accessible.", pl: "Semantyczny, dostępny markup." },
    experience: { en: "Foundation of all web work.", fr: "Base de tous les projets web.", pl: "Podstawa pracy webowej." },
    projects: ["All web projects"] },
  { id: "css", title: "CSS", category: "Frontend", icon: "🎨", color: "cyan",
    desc: { en: "Modern CSS: grid, flex, container queries, animations.", fr: "CSS moderne : grid, flex, animations.", pl: "Nowoczesny CSS: grid, flex, animacje." },
    experience: { en: "Custom design systems & motion design.", fr: "Design systems & motion design.", pl: "Design systemy i motion design." },
    projects: ["Portfolio CRT effects"] },
];

export type Store = {
  lang: Lang;
  unlocked: string[];
  recruiter: boolean;
  started: boolean;
};

const KEY = "arcade-portfolio-v1";

const defaultStore: Store = { lang: "en", unlocked: [], recruiter: false, started: false };

type Ctx = {
  store: Store;
  t: Dict;
  setLang: (l: Lang) => void;
  unlock: (id: string) => boolean;
  enableRecruiter: () => void;
  start: () => void;
  reset: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(defaultStore);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStore({ ...defaultStore, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
  }, [store]);

  const value = useMemo<Ctx>(() => ({
    store,
    t: translations[store.lang],
    setLang: (lang) => setStore((s) => ({ ...s, lang })),
    unlock: (id) => {
      let isNew = false;
      setStore((s) => {
        if (s.unlocked.includes(id)) return s;
        isNew = true;
        return { ...s, unlocked: [...s.unlocked, id] };
      });
      return isNew;
    },
    enableRecruiter: () =>
      setStore((s) => ({ ...s, recruiter: true, started: true, unlocked: ACHIEVEMENTS.map((a) => a.id) })),
    start: () => setStore((s) => ({ ...s, started: true })),
    reset: () => setStore(defaultStore),
  }), [store]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("AppProvider missing");
  return c;
}
