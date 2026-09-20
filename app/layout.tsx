import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "নিউজগেটর — সব খবর এক পাতায়",
  description:
    "বাংলাদেশ ও বিশ্বের গুরুত্বপূর্ণ সংবাদ, নির্ভরযোগ্য সব উৎস থেকে এক পাতায়।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f4f6f8] font-['Noto_Sans_Bengali','Hind_Siliguri','Segoe_UI',Arial,sans-serif] text-[#101828] antialiased transition-colors duration-300 dark:bg-[#0b1018] dark:text-[#eaf0f6] reading:bg-[#f4ecd8] reading:text-[#3b3027]">
        <a className="skip-link" href="#main-content">মূল সংবাদে যান</a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
