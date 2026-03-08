/**
 * Application Initialization
 * 
 * This module handles initialization tasks that must run when the application starts.
 * Currently, this includes validating encryption configuration.
 */

import { validateEncryptionConfig } from './encryption';

/**
 * Initialize the application
 * 
 * This function should be called during application startup to ensure
 * all required services are properly configured.
 * 
 * @throws Error if initialization fails
 */
export function initializeApp(): void {
  // Validate encryption configuration
  if (!validateEncryptionConfig()) {
    throw new Error('Application initialization failed: Encryption not properly configured. Please set TOKEN_ENCRYPTION_KEY and TOKEN_ENCRYPTION_SALT environment variables.');
  }

  console.log('Application initialized successfully');
}
