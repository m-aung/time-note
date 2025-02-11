export type AuthErrorCode = 
  | 'InvalidCredentials'
  | 'EmailNotConfirmed'
  | 'WeakPassword'
  | 'EmailInUse'
  | 'InvalidEmail'
  | 'NetworkError'
  | 'RateLimitExceeded'
  | 'InvalidCurrentPassword'
  | 'PasswordResetFailed'
  | 'DeleteAccountFailed'
  | 'SessionExpired'
  | 'Unknown';

interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export const getAuthError = (error: any): AuthError => {
  if (!error) {
    return {
      code: 'Unknown',
      message: 'An unknown error occurred',
    };
  }

  const errorMessage = error.message?.toLowerCase() || '';

  // Invalid login credentials
  if (errorMessage.includes('invalid login credentials')) {
    return {
      code: 'InvalidCredentials',
      message: 'Invalid email or password',
    };
  }

  // Email not confirmed
  if (errorMessage.includes('email not confirmed')) {
    return {
      code: 'EmailNotConfirmed',
      message: 'Please verify your email address',
    };
  }

  // Weak password
  if (errorMessage.includes('password')) {
    return {
      code: 'WeakPassword',
      message: 'Password must be at least 6 characters long',
    };
  }

  // Email already registered
  if (errorMessage.includes('email already registered')) {
    return {
      code: 'EmailInUse',
      message: 'This email is already registered',
    };
  }

  // Invalid email format
  if (errorMessage.includes('invalid email')) {
    return {
      code: 'InvalidEmail',
      message: 'Please enter a valid email address',
    };
  }

  // Rate limiting
  if (errorMessage.includes('too many requests')) {
    return {
      code: 'RateLimitExceeded',
      message: 'Too many attempts. Please try again later',
    };
  }

  // Network error
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      code: 'NetworkError',
      message: 'Network error. Please check your connection',
    };
  }

  // Current password incorrect
  if (errorMessage.includes('current password is incorrect')) {
    return {
      code: 'InvalidCurrentPassword',
      message: 'Current password is incorrect',
    };
  }

  // Password reset failed
  if (errorMessage.includes('reset password')) {
    return {
      code: 'PasswordResetFailed',
      message: 'Failed to reset password. Please try again',
    };
  }

  // Delete account failed
  if (errorMessage.includes('delete')) {
    return {
      code: 'DeleteAccountFailed',
      message: 'Failed to delete account. Please try again',
    };
  }

  // Session expired
  if (errorMessage.includes('session expired') || errorMessage.includes('not authenticated')) {
    return {
      code: 'SessionExpired',
      message: 'Your session has expired. Please sign in again',
    };
  }

  // Default error
  return {
    code: 'Unknown',
    message: 'An error occurred. Please try again',
  };
};

export const handleAuthError = (error: any): string => {
  const { message } = getAuthError(error);
  return message;
}; 