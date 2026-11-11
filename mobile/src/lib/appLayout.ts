/** The shell is measured inside the top and side safe areas. */
export function appLayout(width: number, height: number, bottomInset: number) {
  const safeHeight = height - bottomInset;
  // Keep the sidebar off short windows and reserve space for readable content.
  const sidebarWidth = width >= 850 && safeHeight >= 560
    ? width >= 1000 ? 255 : 212
    : 0;
  const contentPadding = sidebarWidth ? 36 : 22;
  const contentWidth = width - sidebarWidth - 2 * contentPadding;
  const twoColumns = contentWidth >= 560;
  const mapHeight = safeHeight > 0 && safeHeight < 450 ? 300 : twoColumns ? 480 : 370;
  return { sidebarWidth, contentPadding, twoColumns, mapHeight };
}
