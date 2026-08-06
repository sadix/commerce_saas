// lib/fonts.ts
export function getGoogleFontUrl(fontName: string): string {
  const formattedName = fontName.trim().replace(/\s+/g, '+');
  // Loads weights 400 (regular) and 700 (bold)
  return `https://fonts.googleapis.com/css?family=${formattedName}:wght@400;700&display=swap`;
}