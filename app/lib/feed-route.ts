export function feedHref(category = "", portalId = "") {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (portalId) params.set("portalId", portalId);
  return params.size ? "/?" + params : "/";
}
export function validPortalId(value: string) {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}
