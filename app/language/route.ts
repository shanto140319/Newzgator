import { cookies } from "next/headers";

export async function POST(request: Request) {
  // JSON requests need a CORS preflight, so other sites cannot change the reader's language.
  if (request.headers.get("content-type") !== "application/json") return new Response(null, { status: 415 });
  const { locale } = await request.json().catch(() => ({}));
  if (locale !== "bn" && locale !== "en") return new Response(null, { status: 400 });
  (await cookies()).set("news-language", locale, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000 });
  return new Response(null, { status: 204 });
}
