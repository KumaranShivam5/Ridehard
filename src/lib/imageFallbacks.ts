// Pre-curated premium default images based on vehicle type keyword matching
export const MOTORCYCLE_FALLBACK_IMAGES = {
  himalayan: 'https://images.unsplash.com/photo-1609137144814-1e0e47087050?auto=format&fit=crop&q=80&w=1000',
  scram: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
  hunter: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=1000',
  activa: 'https://images.unsplash.com/photo-1625121852136-ecfc5a8789cc?auto=format&fit=crop&q=80&w=1000',
  ntorq: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=1000',
  generic: 'https://images.unsplash.com/photo-1558981403-cc5f9899a28bc?auto=format&fit=crop&q=80&w=1000'
};

/**
 * Resolves the appropriate default image based on vehicle model status or name
 */
export function getVehicleFallbackImage(modelName: string = '', name: string = ''): string {
  const combined = `${modelName} ${name}`.toLowerCase();

  if (combined.includes('himalayan')) {
    return MOTORCYCLE_FALLBACK_IMAGES.himalayan;
  }
  if (combined.includes('scram')) {
    return MOTORCYCLE_FALLBACK_IMAGES.scram;
  }
  if (combined.includes('hunter') || combined.includes('re hunter')) {
    return MOTORCYCLE_FALLBACK_IMAGES.hunter;
  }
  if (combined.includes('activa')) {
    return MOTORCYCLE_FALLBACK_IMAGES.activa;
  }
  if (combined.includes('ntorq') || combined.includes('ntroque') || combined.includes('ntorque')) {
    return MOTORCYCLE_FALLBACK_IMAGES.ntorq;
  }

  return MOTORCYCLE_FALLBACK_IMAGES.generic;
}
