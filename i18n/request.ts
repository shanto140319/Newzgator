import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
export default getRequestConfig(async () => {
  const value = (await cookies()).get("news-language")?.value;
  const locale = value === "en" ? "en" : "bn";
  return { locale, timeZone: "Asia/Dhaka", messages: (await import(`../messages/${locale}.json`)).default };
});
