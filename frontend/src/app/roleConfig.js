/**
 * Role-aware dashboard config for /app.
 *
 * Reorganization + gating ONLY — no new backend features. Every panel
 * referenced here already exists; this map just decides which entry points
 * each role sees. Unknown/missing roles fall back to the farmer view.
 *
 * Capability flags:
 *   share        -> ListingPanel ("SHARE") + ExchangePanel ("EXCHANGES")
 *   verification -> extension-worker verification entry point
 *   analytics    -> AT RISK / VULNERABILITY / GAPS map layers
 *   calendar     -> seasonal calendar (useful to everyone with a map)
 */
export const ROLE_CONFIG = {
  farmer: {
    label: 'Farmer',
    share: true,
    verification: false,
    analytics: false,
    calendar: true,
  },
  extension_worker: {
    label: 'Extension worker',
    share: false,
    verification: true,
    analytics: true,
    calendar: true,
  },
  institution: {
    label: 'Institution',
    share: false,
    verification: false,
    analytics: true,
    calendar: true,
  },
  seed_company: {
    label: 'Seed company',
    share: false,
    verification: false,
    analytics: true, // read-only gaps/demand subset
    calendar: false,
  },
  admin: {
    label: 'Admin',
    share: true,
    verification: true,
    analytics: true,
    calendar: true,
  },
}

export function configForRole(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.farmer
}
