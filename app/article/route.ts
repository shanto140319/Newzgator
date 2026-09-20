// Redirect legacy bookmarks before streaming, preserving an actual HTTP 308.
export function GET(request: Request) {
  const ids = new URL(request.url).searchParams.getAll("id");
  const id = ids[0];
  if (ids.length !== 1 || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return new Response("Not found", { status: 404 });
  }
  return Response.redirect(new URL("/article/" + id, request.url), 308);
}
