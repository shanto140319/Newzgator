"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations();

  return <main id="main-content" className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">{t("newsCouldNotBeLoaded")}</h1><p role="alert" className="my-4">{t("pleaseTryAgainInAMoment")}</p><button type="button" className="rounded border px-5 py-3" onClick={reset}>{t("tryAgain")}</button></main>;
}
