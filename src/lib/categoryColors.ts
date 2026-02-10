// Distinct colors for each OSM category
const CATEGORY_COLORS: Record<string, string> = {
  park: '#22c55e',
  garden: '#16a34a',
  forest: '#15803d',
  grass: '#86efac',
  school: '#3b82f6',
  university: '#2563eb',
  college: '#1d4ed8',
  hospital: '#ef4444',
  clinic: '#dc2626',
  building: '#f97316',
  residential: '#fb923c',
  commercial: '#ea580c',
  industrial: '#c2410c',
  road: '#6b7280',
  highway: '#4b5563',
  street: '#9ca3af',
  path: '#d1d5db',
  railway: '#78716c',
  river: '#06b6d4',
  stream: '#22d3ee',
  lake: '#0891b2',
  pond: '#67e8f9',
  watershed: '#0284c7',
  water: '#0ea5e9',
  farmland: '#a3e635',
  meadow: '#84cc16',
  scrub: '#65a30d',
  wetland: '#14b8a6',
  religious: '#a855f7',
  worship: '#9333ea',
  temple: '#7c3aed',
  mosque: '#6d28d9',
  church: '#8b5cf6',
  sports: '#eab308',
  playground: '#facc15',
  stadium: '#ca8a04',
  parking: '#a8a29e',
  cemetery: '#57534e',
  military: '#991b1b',
  government: '#be185d',
  police: '#9f1239',
  fire_station: '#b91c1c',
  retail: '#e879f9',
  marketplace: '#d946ef',
  shop: '#c026d3',
  restaurant: '#f472b6',
  hotel: '#ec4899',
  tourism: '#f43f5e',
  monument: '#e11d48',
  heritage: '#be123c',
  bridge: '#78716c',
  tunnel: '#44403c',
  barrier: '#a1a1aa',
  fence: '#71717a',
  wall: '#52525b',
  powerline: '#fbbf24',
  pipeline: '#f59e0b',
  canal: '#0891b2',
  drain: '#06b6d4',
  ditch: '#22d3ee',
};

// Fallback color for unknown categories
const DEFAULT_COLOR = '#94a3b8';

export function getCategoryColor(category: string): string {
  const normalized = category.toLowerCase().replace(/[\s_-]+/g, '_').trim();
  
  // Try exact match first
  if (CATEGORY_COLORS[normalized]) return CATEGORY_COLORS[normalized];
  
  // Try partial match
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return color;
    }
  }
  
  // Generate a deterministic color from the string
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export function getAllCategoryColors(): Record<string, string> {
  return { ...CATEGORY_COLORS };
}
