import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "নিউজগেটর — সব খবর এক পাতায়",
  description:
    "বাংলাদেশ ও বিশ্বের গুরুত্বপূর্ণ সংবাদ, নির্ভরযোগ্য সব উৎস থেকে এক পাতায়।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
