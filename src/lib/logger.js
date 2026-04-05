import { supabase } from './supabase'

/**
 * Redacts sensitive information from a log metadata object.
 */
function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const REDACTED_KEYS = ['password', 'token', 'secret', 'key', 'cvv', 'api_key', 'auth']
  
  const clean = Array.isArray(obj) ? [] : {}
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.some(k => key.toLowerCase().includes(k))) {
      clean[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      clean[key] = redact(value)
    } else {
      clean[key] = value
    }
  }
  return clean
}

export const logger = {
  /**
   * Core log function that inserts into the system_logs table.
   */
  async log(severity, event_type, action, message, metadata = {}, user_id = null) {
    try {
      const sanitizedMetadata = redact(metadata)
      if (!supabase) {
        console.warn('Logging skipped: Supabase client is not initialized.')
        return
      }

      const { error } = await supabase
        .from('system_logs')
        .insert({
          event_type,
          severity,
          action,
          message,
          metadata: sanitizedMetadata,
          user_id
        })
      
      if (error) console.error('Failed to write system log:', error)
    } catch (err) {
      console.error('Logger runtime error:', err)
    }
  },

  async info(event_type, action, message, metadata = {}, user_id = null) {
    return this.log('info', event_type, action, message, metadata, user_id)
  },

  async warn(event_type, action, message, metadata = {}, user_id = null) {
    return this.log('warn', event_type, action, message, metadata, user_id)
  },

  async error(event_type, action, message, metadata = {}, user_id = null) {
    return this.log('error', event_type, action, message, metadata, user_id)
  }
}
