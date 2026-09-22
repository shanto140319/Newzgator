import { ApiError } from "./api";
export function utilityResponse(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } }); }
export function allowedMutation(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site" && request.headers.get("content-type")?.split(";")[0] === "application/json";
}
export function utilityError(error: unknown) {
  const status = error instanceof ApiError && [400, 401, 403, 404, 409, 429].includes(error.status) ? error.status : 502;
  return utilityResponse({ success: false, message: "পরিবর্তনটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" }, status);
}
