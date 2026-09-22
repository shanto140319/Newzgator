import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const existing = request.cookies.get("news-reader")?.value;
  if (existing && /^usr_[0-9a-f-]{36}$/.test(existing)) return NextResponse.next();
  const id = "usr_" + crypto.randomUUID();
  request.cookies.set("news-reader", id);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set("news-reader", id, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 365 * 24 * 60 * 60 });
  return response;
}
export const config = { matcher: ["/", "/article/:path*", "/saved", "/api/:path*"] };
