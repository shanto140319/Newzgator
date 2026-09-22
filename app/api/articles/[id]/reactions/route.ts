import { utilityRequest } from "../../../../lib/api";
import { validPortalId } from "../../../../lib/feed-route";
import { allowedMutation, utilityError, utilityResponse } from "../../../../lib/utility-route";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!allowedMutation(request)) return utilityResponse({ success: false }, 403);
  const { id } = await params;
  let body;
  try { body = await request.json(); } catch { return utilityResponse({ success: false }, 400); }
  if (!validPortalId(id) || !["LIKE", "DISLIKE", "IMPORTANT", "INACCURATE"].includes(body?.reaction)) return utilityResponse({ success: false }, 400);
  try {
    const result = await utilityRequest("/api/v1/articles/" + id + "/reactions", "POST", { reaction: body.reaction });
    const data = result?.data ?? result;
    if (data?.articleId !== Number(id) || ![null, "LIKE", "DISLIKE", "IMPORTANT", "INACCURATE"].includes(data.activeReaction)) throw new Error("Invalid reaction response");
    return utilityResponse({ success: true, data });
  } catch (error) { return utilityError(error); }
}
