// Shared formatting + privacy helpers for public (unauthenticated) pages.
// PRIVACY RULE: public pages must NEVER expose individual farmer identity
// (name, phone). Only non-identifying, aggregate/grower-tier signals.

// Trait keys in the data are snake_case (see backend/seed_data.py TRAITS).
const TRAIT_LABELS = {
  drought_resistant: 'Drought-resistant',
  short_season: 'Short-season',
  pest_resistant: 'Pest-resistant',
  high_yield: 'High-yield',
  low_input: 'Low-input',
}

export function traitLabel(key) {
  if (!key) return ''
  return (
    TRAIT_LABELS[key] ||
    String(key)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  )
}

// The six dataset counties (Machakos, Kitui, Makueni, Tharaka-Nithi, Meru, Embu).
export const CROPS = ['Sorghum', 'Millet', 'Cowpea', 'Pigeon Pea', 'Green Gram', 'Maize']
export const COUNTIES = ['Machakos', 'Kitui', 'Makueni', 'Tharaka-Nithi', 'Meru', 'Embu']

// Verification tiers map (see backend/app/services/reputation_service.py).
const TIER_RANK = { Unverified: 0, Confirmed: 1, Champion: 2, 'Seed Bank': 3 }

export function tierLabel(tier) {
  if (!tier || !(tier in TIER_RANK) || tier === 'Unverified') return 'Community-listed'
  return tier
}

// Non-identifying grower signal from grows_info.success_rating (3.0–5.0).
// Returns null when there is no real rating (so the UI can hide it, never fake).
export function fieldSuccess(rating) {
  const n = Number(rating)
  if (!Number.isFinite(n) || n <= 0) return null
  return `${n.toFixed(1)} / 5 field success`
}

// Derive a stable, non-identifying location string: county only on public pages.
export function publicLocation(location) {
  if (!location) return null
  return location.county || null
}
