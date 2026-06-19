import reHimalayanImg from '../assets/images/re_himalayan_1781791439226.jpg';
import reScramImg from '../assets/images/re_scram_1781791454194.jpg';
import reHunterImg from '../assets/images/re_hunter_1781791468880.jpg';
import hondaActivaImg from '../assets/images/honda_activa_1781791486777.jpg';
import tvsNtorqImg from '../assets/images/tvs_ntorq_1781791500820.jpg';
import genericBikeImg from '../assets/images/generic_bike_1781791516299.jpg';

// Pre-curated premium default images based on vehicle type keyword matching
export const MOTORCYCLE_FALLBACK_IMAGES = {
  himalayan: reHimalayanImg,
  scram: reScramImg,
  hunter: reHunterImg,
  activa: hondaActivaImg,
  ntorq: tvsNtorqImg,
  generic: genericBikeImg
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
