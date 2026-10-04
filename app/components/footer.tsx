import { useTranslations } from "next-intl";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[#0c1c34] text-white dark:bg-[#070b11] reading:bg-[#514438]">
      <div className="mx-auto flex w-[min(1240px,calc(100%-48px))] items-end justify-between gap-10 py-12 max-sm:block max-sm:w-[calc(100%-30px)] max-sm:py-10">
        <div>
          <Link
            className="brand"
            href="/"
            aria-label={t("newsgatorHome")}
          >
            <BrandLogo />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400 reading:text-[#d6c8b5]">
            {t("importantNewsFromBangladeshAndTheWorldInOnePlace")}</p>
        </div>
        <div className="flex gap-6 text-sm font-semibold text-slate-300 max-sm:mt-8 max-sm:flex-wrap reading:text-[#eee4d3]">
          <Link className="hover:text-white" href="/">
            {t("latest")}</Link>
          <Link className="hover:text-white" href="mailto:hello@newsgator.news">
            {t("contact")}</Link>
          <Link className="hover:text-white" href="#top">
            {t("backToTop")}</Link>
        </div>
      </div>
      <div className="mx-auto flex w-[min(1240px,calc(100%-48px))] justify-between gap-6 border-t border-white/10 py-4 text-xs text-slate-400 max-sm:grid max-sm:w-[calc(100%-30px)] max-sm:gap-0.5 reading:text-[#d6c8b5]">
        <span>© {new Date().getFullYear()} {t("newsgator")}</span>
        <span>{t("newsBelongsToItsRespectivePublishers")}</span>
      </div>
    </footer>
  );
}
