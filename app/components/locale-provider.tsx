"use client";
import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import bn from "../../messages/bn.json";
import en from "../../messages/en.json";

export type Locale = "bn" | "en";
const messages = { bn, en };
const ChangeLocale = createContext<(locale: Locale) => Promise<void>>(async () => {});
export const useChangeLocale = () => useContext(ChangeLocale);

/** Interface text is static, so switching language swaps messages in place instead of re-rendering the page on the server. */
export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocale] = useState(initialLocale);
  const change = useCallback(async (next: Locale) => {
    setLocale(next);
    document.documentElement.lang = next;
    // The cookie only matters for the next server render, so the switch does not wait for it.
    const response = await fetch("/language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: next }) });
    if (!response.ok) throw new Error("Language could not be saved");
  }, []);
  return <ChangeLocale value={change}>
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Asia/Dhaka">{children}</NextIntlClientProvider>
  </ChangeLocale>;
}
