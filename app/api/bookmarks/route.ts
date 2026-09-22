import { getBookmarks, utilityRequest } from "../../lib/api";
import { allowedMutation, utilityError, utilityResponse } from "../../lib/utility-route";
export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get("cursor") ?? "";
  if (cursor.length > 2048) return utilityResponse({ success: false }, 400);
  try { return utilityResponse({ success: true, data: await getBookmarks(cursor) }); } catch (error) { return utilityError(error); }
}
export async function POST(request: Request) {
  if (!allowedMutation(request)) return utilityResponse({ success: false }, 403);
  let body;
  try { body = await request.json(); } catch { return utilityResponse({ success: false }, 400); }
  if (!Number.isSafeInteger(body?.articleId) || body.articleId < 1) return utilityResponse({ success: false }, 400);
  try { await utilityRequest("/api/v1/bookmarks", "POST", { articleId: body.articleId }); return utilityResponse({ success: true }); } catch (error) { return utilityError(error); }
}
