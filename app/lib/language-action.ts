"use server";
import { cookies } from "next/headers";
export async function setLanguage(locale: string) {
  if (locale !== "bn" && locale !== "en") throw new Error("Unsupported language");
  (await cookies()).set("news-language", locale, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000 });
}
