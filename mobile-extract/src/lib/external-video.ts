/**
 * External Video Utility
 * 
 * Handles validation and metadata extraction for external video links
 * (YouTube, Vimeo, etc.)
 */

export interface VideoMetadata {
  provider: 'youtube' | 'vimeo' | 'other';
  externalId: string;
  url: string;
  title?: string;
  thumbnailUrl?: string;
  duration?: number;
  isAvailable: boolean;
}

export interface OEmbedResponse {
  type: string;
  version: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html?: string;
  width?: number;
  height?: number;
}

/**
 * Validates if a URL is a supported external video link
 */
export function validateExternalUrl(url: string): {
  isValid: boolean;
  provider?: 'youtube' | 'vimeo' | 'other';
  externalId?: string;
  error?: string;
} {
  try {
    const normalizedUrl = url.trim();

    // Check if it's a valid URL
    new URL(normalizedUrl);

    // YouTube validation
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
      const match = normalizedUrl.match(pattern);
      if (match) {
        return {
          isValid: true,
          provider: 'youtube',
          externalId: match[1],
        };
      }
    }

    // Vimeo validation
    const vimeoPatterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of vimeoPatterns) {
      const match = normalizedUrl.match(pattern);
      if (match) {
        return {
          isValid: true,
          provider: 'vimeo',
          externalId: match[1],
        };
      }
    }

    return {
      isValid: false,
      error: 'Unsupported video provider. Only YouTube and Vimeo are supported.',
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Extracts video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extracts video ID from various Vimeo URL formats
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetches OEmbed metadata for a video URL
 * Note: This requires a server-side implementation to avoid CORS issues
 */
export async function fetchOEmbedMeta(
  url: string,
  provider: 'youtube' | 'vimeo'
): Promise<OEmbedResponse | null> {
  try {
    let oembedUrl: string;

    if (provider === 'youtube') {
      // YouTube doesn't have a public OEmbed endpoint without an API key
      // We'll return basic metadata
      const videoId = extractYouTubeId(url);
      if (!videoId) return null;

      return {
        type: 'video',
        version: '1.0',
        provider_name: 'YouTube',
        provider_url: 'https://www.youtube.com/',
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        thumbnail_width: 480,
        thumbnail_height: 360,
      };
    } else if (provider === 'vimeo') {
      oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(oembedUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching OEmbed metadata:', error);
    return null;
  }
}

/**
 * Gets video metadata from external URL
 */
export async function getVideoMetadata(url: string): Promise<VideoMetadata | null> {
  const validation = validateExternalUrl(url);

  if (!validation.isValid || !validation.provider || !validation.externalId) {
    return null;
  }

  const { provider, externalId } = validation;

  try {
    // Fetch OEmbed metadata
    const oembedData = await fetchOEmbedMeta(url, provider);

    // For YouTube, we can get thumbnail directly
    let thumbnailUrl = oembedData?.thumbnail_url;
    if (provider === 'youtube' && !thumbnailUrl) {
      thumbnailUrl = `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`;
    }

    return {
      provider,
      externalId,
      url,
      title: oembedData?.title,
      thumbnailUrl,
      isAvailable: true,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return null;
  }
}

/**
 * Generates embed HTML for a video
 */
export function generateEmbedHtml(
  provider: 'youtube' | 'vimeo',
  externalId: string,
  width: number = 640,
  height: number = 360
): string {
  if (provider === 'youtube') {
    return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${externalId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (provider === 'vimeo') {
    return `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${externalId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }

  return '';
}

/**
 * Checks if a video is available by making a HEAD request
 */
export async function checkVideoAvailability(url: string): Promise<boolean> {
  try {
    const validation = validateExternalUrl(url);
    
    if (!validation.isValid || !validation.provider) {
      return false;
    }

    // For YouTube, we can check the thumbnail
    if (validation.provider === 'youtube' && validation.externalId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${validation.externalId}/hqdefault.jpg`;
      const response = await fetch(thumbnailUrl, { method: 'HEAD' });
      return response.ok;
    }

    // For Vimeo, we can try the OEmbed endpoint
    if (validation.provider === 'vimeo') {
      const oembedData = await fetchOEmbedMeta(url, 'vimeo');
      return oembedData !== null;
    }

    return false;
  } catch (error) {
    console.error('Error checking video availability:', error);
    return false;
  }
}

/**
 * Normalizes a video URL to a standard format
 */
export function normalizeVideoUrl(url: string): string {
  const validation = validateExternalUrl(url);

  if (!validation.isValid || !validation.provider || !validation.externalId) {
    return url;
  }

  const { provider, externalId } = validation;

  if (provider === 'youtube') {
    return `https://www.youtube.com/watch?v=${externalId}`;
  } else if (provider === 'vimeo') {
    return `https://vimeo.com/${externalId}`;
  }

  return url;
}
