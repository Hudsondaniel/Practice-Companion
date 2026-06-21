/** Map Supabase Auth API errors to user-facing copy. */
export function mapAuthError(error: { message: string; code?: string; status?: number }): string {
  const { message, code } = error
  const lower = message.toLowerCase()

  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    lower.includes('rate limit')
  ) {
    return 'Too many signup attempts from this project. Wait about an hour, then try again — or turn off “Confirm email” in Supabase while testing.'
  }

  if (code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox and spam folder.'
  }

  if (code === 'invalid_credentials' || lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you just signed up, confirm your email first — signup may have failed if you saw a rate-limit message.'
  }

  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in or reset your password.'
  }

  if (lower.includes('password') && lower.includes('6')) {
    return 'Password must be at least 6 characters.'
  }

  if (lower.includes('invalid format') && lower.includes('email')) {
    return 'Please enter a valid email address.'
  }

  if (lower.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }

  return message || 'Authentication failed. Please try again.'
}

export const AUTH_CONFIRM_EMAIL = 'CONFIRM_EMAIL_REQUIRED'
export const AUTH_ACCOUNT_EXISTS = 'ACCOUNT_EXISTS'
