/**
 * Canonical logic for JobBlitz Packet States.
 * Ensures consistent "X of 3 ready" and status labels across all views.
 */

/**
 * Calculates readiness stats for a session/packet.
 * @param {Object} session - The session object from the backend/hook.
 * @returns {Object} { readyCount, hasResume, hasCover, hasInterview, isComplete }
 */
export function getPacketStats(session) {
  if (!session) return { readyCount: 0, hasResume: false, hasCover: false, hasInterview: false, isComplete: false };

  // Note: Backend might send different field names depending on whether it's a list or full fetch
  // We handle both legacy and full-view structures here.
  const hasResume = !!(session.tailored_resume || session.tailoredResume);
  const hasCover = !!(session.cover_letters?.length || session.coverLetter);
  const hasInterview = !!(
    (session.interview_prep?.length && session.interview_prep?.[0]?.questions?.length) || 
    (session.interviewData?.questions?.length)
  );

  const readyCount = [hasResume, hasCover, hasInterview].filter(Boolean).length;

  return {
    readyCount,
    hasResume,
    hasCover,
    hasInterview,
    isComplete: readyCount === 3
  };
}

/**
 * Maps a session to a standardized UI label and color scheme.
 * @param {Object} session - The session object.
 * @returns {Object} { text, dot, bg, color, key }
 */
export function getPacketStatusInfo(session) {
  const stats = getPacketStats(session);
  const explicitStatus = session.packet_status || session.packetStatus;

  // 1. Forced overrides (Applied, Failed, Generating)
  if (explicitStatus === 'applied') {
    return { key: 'applied', text: 'Applied', dot: '#0e0099', bg: '#e1e0ff', color: '#0e0099' };
  }
  if (explicitStatus === 'failed') {
    return { key: 'failed', text: 'Failed', dot: '#93000a', bg: '#ffdad6', color: '#93000a' };
  }
  if (explicitStatus === 'generating') {
    return { key: 'generating', text: 'Generating...', dot: '#0e0099', bg: '#e1e0ff', color: '#2f2ebe' };
  }

  // 2. Derived from content
  if (stats.isComplete) {
    return { key: 'ready', text: 'Complete', dot: '#2e7d32', bg: '#e8f5e9', color: '#2e7d32' };
  }
  if (stats.readyCount > 0) {
    return { key: 'partial', text: `${stats.readyCount} of 3 ready`, dot: '#f59e0b', bg: '#fffbeb', color: '#92400e' };
  }

  // 3. Draft/Empty fallback
  return { key: 'empty', text: 'Not generated', dot: '#c5c6ce', bg: '#f2f4f6', color: '#75777e' };
}
