import { getArticles } from "../../lib/api";
import { validPortalId } from "../../lib/feed-route";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category") ?? "";
  const portalId = params.get("portalId") ?? "";
  const cursor = params.get("cursor") ?? "";
  if ((category && !/^[a-z0-9-]{1,80}$/.test(category)) || cursor.length > 2048 || (portalId && !validPortalId(portalId))) return Response.json({ success: false }, { status: 400 });
  try { return Response.json({ success: true, data: await getArticles(category, cursor, portalId) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    console.error("Article API request failed", error);
    return Response.json({ success: false, message: "সংবাদ আনা যায়নি।" }, { status: 502 });
  }
}
