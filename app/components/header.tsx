import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { SearchModal } from "./search-modal";
import { BrandLogo } from "./brand-logo";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import styles from "./header.module.css";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className={styles.siteHeader}>
      <div className={styles.utilityBar}>
        <div className={`site-container ${styles.utilityInner}`}>
          <span>{t("trustedNewsFromBangladeshAndTheWorld")}</span>
          <time dateTime={new Date().toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "Asia/Dhaka" }).format(new Date())}</time>
        </div>
      </div>
      <div className={`site-container ${styles.headerMain}`}>
        <Link className="brand" href="/" aria-label={t("newsgatorHome")}>
          <BrandLogo />
        </Link>
        <SearchModal />
        <div className={styles.headerTools}>
          <Link href="/saved" prefetch={false} className="muted hidden text-sm font-semibold hover:text-[var(--accent)] sm:inline-flex">
            {t("saved")}</Link>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

    </header>
  );
}
