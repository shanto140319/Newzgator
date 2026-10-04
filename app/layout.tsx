import { Hind_Siliguri } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"), title: t("newsgatorAllYourNewsInOnePlace"), description: t("importantNewsFromBangladeshAndTheWorldGatheredFromTrustedSources") };
}
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getTranslations();
  return <html lang={locale} className={hindSiliguri.variable} suppressHydrationWarning>
    <body className="min-h-screen bg-[#f4f6f8] font-sans text-[#101828] antialiased transition-colors duration-300 dark:bg-[#0b1018] dark:text-[#eaf0f6] reading:bg-[#f4ecd8] reading:text-[#3b3027]">
      <a className="skip-link" href="#main-content">{t("skipToNews")}</a>
      <NextIntlClientProvider><ThemeProvider>{children}</ThemeProvider></NextIntlClientProvider>
    </body>
  </html>;
}
