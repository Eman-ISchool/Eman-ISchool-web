/**
 * Build Artifact Types
 *
 * Type definitions for mobile build artifacts (APK, IPA)
 * and related metadata.
 */

/**
 * Platform type for build artifacts
 */
export type BuildPlatform = 'android' | 'ios' | 'pwa';

/**
 * Build artifact metadata
 */
export interface BuildArtifact {
  /** Platform identifier */
  platform: BuildPlatform;
  /** Version string (e.g., "1.0.0") */
  version: string;
  /** Filename of the artifact */
  filename: string;
  /** Download URL for the artifact */
  downloadUrl: string;
  /** File size in bytes */
  fileSize: number;
  /** Build timestamp in ISO 8601 format */
  buildDate: string;
  /** SHA-256 checksum for integrity verification */
  checksum?: string;
}

/**
 * Builds manifest structure
 */
export interface BuildsManifest {
  /** Latest version number */
  latestVersion: string;
  /** List of all available build artifacts */
  artifacts: BuildArtifact[];
  /** Manifest generation timestamp */
  generatedAt: string;
}

/**
 * Platform-specific build configuration
 */
export interface BuildConfig {
  /** Platform identifier */
  platform: BuildPlatform;
  /** Build type (debug, release, adhoc) */
  buildType: 'debug' | 'release' | 'adhoc';
  /** Minimum supported version */
  minVersion?: string;
  /** Release notes for this build */
  releaseNotes?: string;
}

/**
 * File size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Parse version string and compare
 * Returns -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}
