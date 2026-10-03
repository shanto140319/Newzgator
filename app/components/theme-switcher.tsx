"use client";
import { useTranslations } from "next-intl";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export function ThemeSwitcher() {
  const t = useTranslations();

const themes = [
  { value: "light", label: t("light"), icon: "☀" },
  { value: "dark", label: t("dark"), icon: "◐" },
  { value: "reading", label: t("reading"), icon: "Aa" },
] as const;


  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5 reading:border-[#d8ccb5] reading:bg-[#e9dec7]"
      aria-label={t("chooseColorTheme")}
    >
      {themes.map((item) => {
        const active = mounted && theme === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => setTheme(item.value)}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9482b] sm:px-3 ${
              active
                ? "bg-white text-[#101828] shadow-sm dark:bg-[#263244] dark:text-white reading:bg-[#fffaf0] reading:text-[#3b3027]"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white reading:text-[#66513d] reading:hover:text-[#3b3027]"
            }`}
            aria-pressed={active}
            title={item.label}
          >
            <span aria-hidden="true" className="text-[13px] leading-none">
              {item.icon}
            </span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
