import { SearchModal } from "./search-modal";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/brand/newsgator-logo-english-v1.png";
import { ThemeSwitcher } from "./theme-switcher";
import styles from "./header.module.css";

export function Header() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.utilityBar}>
        <div className={`site-container ${styles.utilityInner}`}>
          <span>বাংলাদেশ ও বিশ্বের নির্ভরযোগ্য সংবাদ</span>
          <time dateTime="2026-09-26">শনিবার, ২৬ সেপ্টেম্বর, ২০২৬</time>
        </div>
      </div>
      <div className={`site-container ${styles.headerMain}`}>
        <Link className="brand" href="/" aria-label="NewsGator হোম">
          <Image
            className="brand-logo"
            src={logo}
            alt="NewsGator"
            sizes="(max-width: 640px) 180px, 248px"
            loading="eager"
          />
        </Link>
        <SearchModal />
        <div className={styles.headerTools}>
          <Link href="/saved" prefetch={false} className="muted hidden text-sm font-semibold hover:text-[var(--accent)] sm:inline-flex">
            সংরক্ষিত
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

    </header>
  );
}
