export const PLAN_LIMITS = {
  free: {
    monthly_tailors: 5,
    monthly_cover_letters: 5,
    features: {
      url_import: false,
      voice_interview: false,
      saved_versions: false,
    },
  },
  pro: {
    monthly_tailors: 50,
    monthly_cover_letters: 50,
    features: {
      url_import: true,
      voice_interview: true,
      saved_versions: true,
    },
  },
}

export const DEFAULT_PLAN = 'free'
