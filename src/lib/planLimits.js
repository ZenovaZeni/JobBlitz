export const PLAN_LIMITS = {
  free: {
    monthly_sessions: 5,
    features: {
      url_import: false,
      voice_interview: false,
      saved_versions: false,
    }
  },
  pro: {
    monthly_sessions: 50,
    features: {
      url_import: true,
      voice_interview: true,
      saved_versions: true,
    }
  }
};

export const DEFAULT_PLAN = 'free';
