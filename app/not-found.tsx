import { useTranslations } from "next-intl";
import Link from "next/link";
export default function NotFound() {
  const t = useTranslations();

  return <main id="main-content" className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">{t("articleNotFound")}</h1><Link href="/" className="mt-6 inline-block underline">{t("backToAllNewsAlt")}</Link></main>;
}
