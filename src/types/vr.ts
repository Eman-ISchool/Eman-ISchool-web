/**
 * VR Educational Experience Type Definitions
 *
 * This file contains TypeScript interfaces and types for VR experiences,
 * scenes, hotspots, tracking data, and subject-specific content.
 */

import { Vector3 } from 'three';

// ============================================================================
// Core VR Types
// ============================================================================

/**
 * VR experience mode types
 */
export type VRMode = 'vr' | '3d' | '2d';

/**
 * VR experience categories matching the three subjects
 */
export type VRExperienceCategory = 'field-trip' | 'science' | 'geography';

/**
 * VR experience difficulty level
 */
export type VRDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Supported languages for VR content
 */
export type VRLanguage = 'en' | 'ar';

/**
 * Hotspot interaction types
 */
export type HotspotType = 'info' | 'navigation' | 'interactive' | 'quiz';

/**
 * VR session status
 */
export type VRSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

// ============================================================================
// Localized Content
// ============================================================================

/**
 * Bilingual text content (Arabic & English)
 */
export interface LocalizedContent {
  en: string;
  ar: string;
}

/**
 * Rich content that can include text, images, and media
 */
export interface RichContent {
  title: LocalizedContent;
  description: LocalizedContent;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

// ============================================================================
// VR Hotspot Types
// ============================================================================

/**
 * Position in 3D space for hotspot placement
 */
export interface HotspotPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Base hotspot interface for interactive points in VR scenes
 */
export interface VRHotspot {
  id: string;
  type: HotspotType;
  position: HotspotPosition;
  title: LocalizedContent;
  description?: LocalizedContent;
  icon?: string;
  color?: string;
  scale?: number;
  isVisible?: boolean;
}

/**
 * Information hotspot - displays educational content
 */
export interface InfoHotspot extends VRHotspot {
  type: 'info';
  content: RichContent;
  relatedHotspots?: string[];
}

/**
 * Navigation hotspot - teleports to another scene
 */
export interface NavigationHotspot extends VRHotspot {
  type: 'navigation';
  targetSceneId: string;
  previewImageUrl?: string;
  transitionDuration?: number;
}

/**
 * Interactive hotspot - triggers custom interactions
 */
export interface InteractiveHotspot extends VRHotspot {
  type: 'interactive';
  interactionType: 'rotate' | 'scale' | 'animate' | 'toggle';
  modelUrl?: string;
  animationName?: string;
}

/**
 * Quiz hotspot - presents educational questions
 */
export interface QuizHotspot extends VRHotspot {
  type: 'quiz';
  question: LocalizedContent;
  options: Array<{
    id: string;
    text: LocalizedContent;
    isCorrect: boolean;
  }>;
  explanation?: LocalizedContent;
  points?: number;
}

/**
 * Union type of all hotspot types
 */
export type AnyHotspot = InfoHotspot | NavigationHotspot | InteractiveHotspot | QuizHotspot;

// ============================================================================
// VR Scene Types
// ============================================================================

/**
 * Scene environment type
 */
export type SceneEnvironment = '360-image' | '3d-model' | 'hybrid';

/**
 * Camera settings for a VR scene
 */
export interface CameraSettings {
  initialRotation?: {
    x: number;
    y: number;
    z: number;
  };
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enableZoom?: boolean;
  zoomRange?: {
    min: number;
    max: number;
  };
}

/**
 * Lighting configuration for 3D scenes
 */
export interface LightingConfig {
  ambientIntensity?: number;
  ambientColor?: string;
  directionalIntensity?: number;
  directionalColor?: string;
  directionalPosition?: HotspotPosition;
}

/**
 * VR Scene representing a single viewpoint or location
 */
export interface VRScene {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  environmentType: SceneEnvironment;
  imageUrl?: string;
  modelUrl?: string;
  thumbnailUrl: string;
  hotspots: AnyHotspot[];
  camera?: CameraSettings;
  lighting?: LightingConfig;
  audioUrl?: string;
  audioLoop?: boolean;
  audioVolume?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// VR Experience Types
// ============================================================================

/**
 * Main VR Experience container
 */
export interface VRExperience {
  id: string;
  slug: string;
  title: LocalizedContent;
  description: LocalizedContent;
  category: VRExperienceCategory;
  subject: string;
  gradeLevel?: string[];
  difficulty: VRDifficultyLevel;
  thumbnailUrl: string;
  coverImageUrl: string;
  estimatedDuration: number;
  scenes: VRScene[];
  initialSceneId: string;
  learningObjectives: LocalizedContent[];
  keywords: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Subject-Specific Content Types
// ============================================================================

/**
 * Historical site for field trip experiences
 */
export interface HistoricalSite {
  id: string;
  name: LocalizedContent;
  location: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  period: LocalizedContent;
  significance: LocalizedContent;
  facts: LocalizedContent[];
  relatedSites?: string[];
  imageGallery?: string[];
}

/**
 * Science concept for 3D visualizations
 */
export interface ScienceConcept {
  id: string;
  name: LocalizedContent;
  category: 'biology' | 'chemistry' | 'physics' | 'astronomy' | 'earth-science';
  gradeLevel: string[];
  description: LocalizedContent;
  keyPoints: LocalizedContent[];
  realWorldApplications?: LocalizedContent[];
  relatedConcepts?: string[];
  modelUrl?: string;
  diagramUrl?: string;
}

/**
 * Geographical location for geography experiences
 */
export interface GeographicalLocation {
  id: string;
  name: LocalizedContent;
  locationType: 'river' | 'mountain' | 'desert' | 'coast' | 'city' | 'ecosystem';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: LocalizedContent;
  climate: LocalizedContent;
  ecology?: LocalizedContent;
  humanImpact?: LocalizedContent;
  keyFeatures: LocalizedContent[];
  imageGallery?: string[];
}

// ============================================================================
// VR Session & Analytics Types
// ============================================================================

/**
 * Hotspot interaction event
 */
export interface HotspotInteraction {
  hotspotId: string;
  hotspotType: HotspotType;
  sceneId: string;
  timestamp: string;
  duration?: number;
  completed?: boolean;
}

/**
 * Scene visit tracking
 */
export interface SceneVisit {
  sceneId: string;
  enteredAt: string;
  exitedAt?: string;
  duration?: number;
  hotspotsInteracted: string[];
}

/**
 * Quiz attempt result
 */
export interface QuizAttempt {
  hotspotId: string;
  sceneId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: string;
  timeToAnswer?: number;
}

/**
 * VR Session data for tracking and analytics
 */
export interface VRSessionData {
  id: string;
  userId: string;
  experienceId: string;
  status: VRSessionStatus;
  vrMode: VRMode;
  deviceType: 'headset' | 'mobile' | 'desktop';
  startedAt: string;
  endedAt?: string;
  totalDuration?: number;
  scenesVisited: SceneVisit[];
  hotspotsInteracted: HotspotInteraction[];
  quizAttempts?: QuizAttempt[];
  completionPercentage: number;
  score?: number;
  metadata?: {
    browserName?: string;
    browserVersion?: string;
    webXRSupported?: boolean;
    displayMode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Aggregated VR progress for a user
 */
export interface VRUserProgress {
  userId: string;
  totalExperiences: number;
  completedExperiences: number;
  inProgressExperiences: number;
  totalTimeSpent: number;
  experiencesByCategory: {
    [key in VRExperienceCategory]: {
      total: number;
      completed: number;
      timeSpent: number;
    };
  };
  totalHotspotsViewed: number;
  totalQuizzesTaken: number;
  averageScore?: number;
  lastActivity?: string;
  achievements?: string[];
}

// ============================================================================
// VR Device Capabilities
// ============================================================================

/**
 * WebXR device capabilities
 */
export interface VRCapabilities {
  hasWebXRSupport: boolean;
  hasVRHeadset: boolean;
  hasARSupport: boolean;
  hasHandTracking: boolean;
  hasControllers: boolean;
  displayMode: 'immersive-vr' | 'immersive-ar' | 'inline' | 'none';
  maxTextureSize?: number;
  supportsWebGL2: boolean;
  performanceLevel?: 'high' | 'medium' | 'low';
  isMobile: boolean;
  devicePixelRatio: number;
}

/**
 * VR control scheme configuration
 */
export interface VRControlScheme {
  mode: VRMode;
  enableGazeControl: boolean;
  enableMouseControl: boolean;
  enableTouchControl: boolean;
  enableKeyboardControl: boolean;
  enableVRControllers: boolean;
  gazeDuration?: number;
  mouseSensitivity?: number;
  touchSensitivity?: number;
}

// ============================================================================
// VR UI Component Props
// ============================================================================

/**
 * Props for VR info panel component
 */
export interface VRInfoPanelProps {
  content: RichContent;
  position: HotspotPosition;
  width?: number;
  height?: number;
  isVisible: boolean;
  onClose?: () => void;
  language: VRLanguage;
}

/**
 * Props for VR navigation menu
 */
export interface VRNavigationProps {
  scenes: VRScene[];
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;
  onExit: () => void;
  language: VRLanguage;
}

/**
 * Props for VR loading screen
 */
export interface VRLoadingProps {
  progress: number;
  message?: LocalizedContent;
  estimatedTime?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * VR experience filters for listing/searching
 */
export interface VRExperienceFilters {
  category?: VRExperienceCategory;
  subject?: string;
  gradeLevel?: string;
  difficulty?: VRDifficultyLevel;
  search?: string;
  isPublished?: boolean;
}

/**
 * VR experience sort options
 */
export type VRExperienceSortBy =
  | 'recent'
  | 'popular'
  | 'title'
  | 'duration'
  | 'difficulty';

/**
 * VR asset loading state
 */
export interface VRAssetLoadingState {
  isLoading: boolean;
  progress: number;
  error?: string;
  loadedAssets: string[];
  totalAssets: number;
}

/**
 * VR error types
 */
export type VRErrorType =
  | 'webxr-not-supported'
  | 'asset-load-failed'
  | 'scene-not-found'
  | 'session-creation-failed'
  | 'network-error'
  | 'unknown';

/**
 * VR error info
 */
export interface VRError {
  type: VRErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export {};
