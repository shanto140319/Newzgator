export type FeedLayout = "grid" | "horizontal" | "featured";

/** Fixed groups never depend on article IDs or a random seed. */
export function feedLayouts(count: number): FeedLayout[] {
  return Array.from({ length: count }, (_, index) => {
    const slot = index % 22;
    return slot < 12 ? "grid" : slot < 20 ? "horizontal" : "featured";
  });
}
