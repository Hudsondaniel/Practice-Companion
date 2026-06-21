export { mapAuthError } from '@/lib/auth-errors'

export function mapSyncError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('session')) {
    return 'Your session expired. Please sign in again.'
  }
  if (lower.includes('relation') || lower.includes('does not exist')) {
    return import.meta.env.DEV
      ? 'Database tables missing. Run migrations in Supabase SQL Editor.'
      : 'We could not load your data. Please try again in a moment.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Connection problem. Check your internet and try again.'
  }
  if (lower.includes('permission') || lower.includes('policy') || lower.includes('row-level')) {
    return 'We could not access your account data. Try signing out and back in.'
  }
  return 'We could not sync your practice data. Please try again.'
}

export function mapSaveError(message: string): string {
  return mapSyncError(message)
}

/** Generic message when the app is misconfigured in production */
export const APP_UNAVAILABLE_MESSAGE =
  'Practice Assistant is temporarily unavailable. Please try again later.'

export const SYNC_OFFLINE_MESSAGE =
  'Not connected — your latest changes may not be saved yet.'

export const SYNC_SAVING_MESSAGE = 'Saving your progress…'
