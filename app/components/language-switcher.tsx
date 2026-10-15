"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useChangeLocale, type Locale } from "./locale-provider";
import styles from "./header.module.css";

const languages = [
  { value: "bn", label: "বাংলা", short: "বাং" },
  { value: "en", label: "English", short: "EN" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const changeLocale = useChangeLocale();
  const [failed, setFailed] = useState(false);
  function choose(value: Locale) {
    if (value === locale) return;
    setFailed(false);
    void changeLocale(value).catch(() => setFailed(true));
  }
  return <div className={styles.language}>
    <div id="site-language" className={styles.languageToggle} data-locale={locale} role="group" aria-label={t("language")}>
      <span className={styles.languageThumb} aria-hidden="true" />
      {languages.map(item => <button key={item.value} type="button" lang={item.value} aria-label={item.label} aria-pressed={locale === item.value} title={item.label} onClick={() => choose(item.value)}>
        <span className={styles.languageFull}>{item.label}</span>
        <span className={styles.languageShort} aria-hidden="true">{item.short}</span>
      </button>)}
    </div>
    {failed && <span className={styles.languageError} role="alert">{t("languageError")}</span>}
  </div>;
}
