// Utility function to convert Firebase error codes to user-friendly messages
export const getFirebaseErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorCode = error.message;

  // Authentication errors
  if (errorCode.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please try logging in instead.';
  }
  
  if (errorCode.includes('auth/weak-password')) {
    return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
  }
  
  if (errorCode.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  
  if (errorCode.includes('auth/user-not-found')) {
    return 'No account found with this email address. Please check your email or register for a new account.';
  }
  
  if (errorCode.includes('auth/wrong-password')) {
    return 'Incorrect password. Please try again.';
  }
  
  if (errorCode.includes('auth/invalid-credential')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (errorCode.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact support.';
  }
  
  if (errorCode.includes('auth/too-many-requests')) {
    return 'Too many failed attempts. Please wait a few minutes before trying again.';
  }
  
  if (errorCode.includes('auth/network-request-failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('auth/operation-not-allowed')) {
    return 'Email/password authentication is not enabled. Please contact support.';
  }
  
  if (errorCode.includes('auth/invalid-api-key')) {
    return 'Authentication service is temporarily unavailable. Please try again later.';
  }

  // Firestore errors
  if (errorCode.includes('firestore/permission-denied')) {
    return 'Permission denied. Please make sure you are logged in.';
  }
  
  if (errorCode.includes('firestore/unavailable')) {
    return 'Database service is temporarily unavailable. Please try again later.';
  }

  // Default fallback
  if (errorCode.includes('Firebase:')) {
    return 'Authentication failed. Please check your credentials and try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};
