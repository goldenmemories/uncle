/**
 * Comprehensive error handling utilities for Supabase and general application errors
 */

/**
 * Maps Supabase PostgreSQL error codes to user-friendly messages
 * @param {string} code - The error code
 * @returns {string} A user-friendly error message
 */
export const getPostgresErrorMessage = (code) => {
  const errorMessages = {
    '23505': 'This record already exists in the database.',
    '23503': 'This operation failed because it references a record that doesn\'t exist.',
    '23514': 'This operation violates a check constraint.',
    '23502': 'A required field is missing.',
    '42P01': 'The table does not exist. Please contact support.',
    '42703': 'Column does not exist. Please contact support.',
    '42P07': 'Table already exists. Please contact support.',
    '42601': 'SQL syntax error. Please contact support.',
    '28P01': 'Invalid credentials. Please check your username and password.',
    '3D000': 'Database does not exist. Please contact support.',
    '08006': 'Connection failed. Please try again later.',
    '08001': 'Unable to establish connection. Please check your network.',
    '57P03': 'Database service unavailable. Please try again later.',
    '53300': 'Too many connections. Please try again later.',
    '53400': 'Configuration limit exceeded. Please contact support.',
    '22P02': 'Invalid text representation. Please check your data format.',
    '22003': 'Numeric value out of range. Please check your input values.',
    '22007': 'Invalid date/time format. Please use YYYY-MM-DD format for dates.',
    '22008': 'Datetime field overflow. Please check your date values.',
    '22P05': 'Invalid binary data format. Please check your file format.',
    'P0001': 'Database raised an exception. Please try again.'
  };
  
  return errorMessages[code] || 'An unexpected database error occurred.';
};

/**
 * Maps Supabase auth error codes to user-friendly messages
 * @param {string} code - The error code
 * @returns {string} A user-friendly error message
 */
export const getAuthErrorMessage = (code) => {
  const errorMessages = {
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-disabled': 'This user account has been disabled.',
    'auth/user-not-found': 'No user with this email address exists.',
    'auth/wrong-password': 'The password is invalid for this email.',
    'auth/email-already-in-use': 'This email is already in use by another account.',
    'auth/weak-password': 'The password is too weak.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
    'auth/requires-recent-login': 'This operation requires re-authentication.',
    'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.'
  };
  
  return errorMessages[code] || 'An authentication error occurred.';
};

/**
 * Process a Supabase error object into a user-friendly message
 * @param {Object} error - The Supabase error object
 * @returns {string} A user-friendly error message
 */
export const formatSupabaseError = (error) => {
  if (!error) return 'An unknown error occurred.';
  
  // Log the full error for debugging
  console.error('Supabase Error:', error);
  
  // Handle PostgreSQL errors
  if (error.code && /^\d\d\w\d\d$/.test(error.code)) {
    return getPostgresErrorMessage(error.code);
  }
  
  // Handle auth errors
  if (error.code && error.code.startsWith('auth/')) {
    return getAuthErrorMessage(error.code);
  }
  
  // Handle general error message
  if (error.message) {
    return error.message;
  }
  
  // If we get here, we have an unexpected error format
  return 'An unexpected error occurred. Please try again later.';
};

/**
 * Handles network errors with appropriate messages
 * @param {Error} error - The caught error
 * @returns {string} A user-friendly error message
 */
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }
  
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your connection or try again later.';
  }
  
  if (error.message && error.message.includes('timeout')) {
    return 'The server request timed out. Please try again later.';
  }
  
  return 'A network error occurred. Please check your connection and try again.';
};

/**
 * Main error handler function that processes all types of errors
 * @param {Error|Object} error - The error object
 * @returns {string} A user-friendly error message
 */
export const handleError = (error) => {
  // Log the error for debugging
  console.error('Application Error:', error);
  
  // Handle null/undefined errors
  if (!error) {
    return 'An unknown error occurred.';
  }
  
  // Handle network errors
  if (!navigator.onLine || 
      (error instanceof TypeError && error.message.includes('Failed to fetch')) ||
      (error.message && error.message.includes('timeout'))) {
    return handleNetworkError(error);
  }
  
  // Handle Supabase errors
  if (error.code || (error.error && error.error.code)) {
    return formatSupabaseError(error.error || error);
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || 'An application error occurred.';
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle unknown error formats
  return 'An unexpected error occurred. Please try again.';
};
