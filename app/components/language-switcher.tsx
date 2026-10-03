"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { setLanguage } from "../lib/language-action";
import styles from "./header.module.css";
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return <div className={styles.language}>
    <label className="sr-only" htmlFor="site-language">{t("language")}</label>
    <select id="site-language" value={locale} disabled={pending} onChange={event => {
      const value = event.target.value; setFailed(false);
      startTransition(async () => { try { await setLanguage(value); } catch { setFailed(true); } });
    }} aria-busy={pending}>
      <option value="bn" lang="bn">বাংলা</option><option value="en" lang="en">English</option>
    </select>
    {failed && <span role="alert">{t("languageError")}</span>}
  </div>;
}
