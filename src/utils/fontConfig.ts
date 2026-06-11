/**
 * Font configuration for the website builder.
 * Maps font keys to CSS variable names, display labels, and categories.
 */

export interface FontOption {
  key: string;
  label: string;
  cssVar: string;
  category: 'sans-serif' | 'serif' | 'display';
  description: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif fonts
  { key: 'inter', label: 'Inter', cssVar: 'var(--font-sans)', category: 'sans-serif', description: 'Clean & modern' },
  { key: 'poppins', label: 'Plus Jakarta Sans', cssVar: 'var(--font-display)', category: 'sans-serif', description: 'Geometric & bold' },
  { key: 'montserrat', label: 'Montserrat', cssVar: 'var(--font-montserrat)', category: 'sans-serif', description: 'Urban & elegant' },
  { key: 'raleway', label: 'Raleway', cssVar: 'var(--font-raleway)', category: 'sans-serif', description: 'Thin & sophisticated' },
  { key: 'outfit', label: 'Outfit', cssVar: 'var(--font-outfit)', category: 'sans-serif', description: 'Friendly & rounded' },
  { key: 'dm-sans', label: 'DM Sans', cssVar: 'var(--font-dm-sans)', category: 'sans-serif', description: 'Minimal & professional' },
  { key: 'space-grotesk', label: 'Space Grotesk', cssVar: 'var(--font-space-grotesk)', category: 'sans-serif', description: 'Tech & futuristic' },
  { key: 'josefin', label: 'Josefin Sans', cssVar: 'var(--font-josefin)', category: 'sans-serif', description: 'Vintage & stylish' },
  { key: 'nunito', label: 'Nunito', cssVar: 'var(--font-nunito)', category: 'sans-serif', description: 'Warm & approachable' },
  // Serif fonts
  { key: 'playfair', label: 'Playfair Display', cssVar: 'var(--font-playfair)', category: 'serif', description: 'Luxury & editorial' },
  { key: 'lora', label: 'Lora', cssVar: 'var(--font-lora)', category: 'serif', description: 'Classic & literary' },
  { key: 'cormorant', label: 'Cormorant Garamond', cssVar: 'var(--font-cormorant)', category: 'serif', description: 'Premium & refined' },
  // System fallback
  { key: 'sans', label: 'System Sans', cssVar: 'system-ui, -apple-system, sans-serif', category: 'sans-serif', description: 'Device default' },
];

/**
 * Get the CSS font-family value for a given font key.
 */
export function getFontFamily(fontKey: string): string {
  const found = FONT_OPTIONS.find(f => f.key === fontKey);
  return found ? found.cssVar : 'var(--font-sans)';
}

/**
 * Get all fonts grouped by category for rendering optgroups in select elements.
 */
export function getFontsByCategory() {
  const sansSerif = FONT_OPTIONS.filter(f => f.category === 'sans-serif');
  const serif = FONT_OPTIONS.filter(f => f.category === 'serif');
  return { sansSerif, serif };
}
