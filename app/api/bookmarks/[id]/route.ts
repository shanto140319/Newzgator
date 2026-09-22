import { utilityRequest } from "../../../lib/api";
import { validPortalId } from "../../../lib/feed-route";
import { allowedMutation, utilityError, utilityResponse } from "../../../lib/utility-route";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!allowedMutation(request)) return utilityResponse({ success: false }, 403);
  const { id } = await params;
  if (!validPortalId(id)) return utilityResponse({ success: false }, 400);
  try { await utilityRequest("/api/v1/bookmarks/" + id, "DELETE"); return utilityResponse({ success: true }); } catch (error) { return utilityError(error); }
}
