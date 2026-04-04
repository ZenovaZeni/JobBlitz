import { PLAN_LIMITS } from './planLimits';

/**
 * Checks if a user can perform a specific action based on their profile and usage.
 * @param {Object} profile - User profile from DB
 * @param {string} action - 'tailor' | 'cover_letter' | 'url_import' | 'voice_interview'
 * @returns {{ allowed: boolean, reason: string }}
 */
export function checkAccess(profile, action) {
  if (!profile) return { allowed: false, reason: 'Profile not found' };

  const tier = (profile.plan_tier || 'free').toLowerCase();
  const status = (profile.subscription_status || 'active').toLowerCase();
  
  // Only 'active' Pro users get Pro limits/features.
  // 'past_due', 'unpaid', or 'canceled' are treated as 'free' for feature gating.
  const effectiveTier = (tier === 'pro' && status === 'active') ? 'pro' : 'free';
  const limits = PLAN_LIMITS[effectiveTier] || PLAN_LIMITS.free;

  // Basic feature flags
  if (action === 'url_import' || action === 'voice_interview' || action === 'saved_versions') {
    const isAllowed = limits.features[action];
    return {
      allowed: isAllowed,
      reason: isAllowed ? '' : `Upgrade to Pro to unlock ${action.replace('_', ' ')}.`
    };
  }

  // Monthly Usage limits
  if (action === 'tailor') {
    const used = profile.tailors_used || 0;
    const limit = limits.monthly_tailors;
    const isAllowed = used < limit || tier === 'pro'; // Pro might have high limits or skip
    return {
      allowed: isAllowed,
      reason: isAllowed ? '' : 'You have reached your monthly tailoring limit. Upgrade to Pro for more.'
    };
  }

  if (action === 'cover_letter') {
    const used = profile.cover_letters_used || 0;
    const limit = limits.monthly_cover_letters;
    const isAllowed = used < limit || tier === 'pro';
    return {
      allowed: isAllowed,
      reason: isAllowed ? '' : 'You have reached your monthly cover letter limit. Upgrade to Pro for more.'
    };
  }

  return { allowed: true, reason: '' };
}
