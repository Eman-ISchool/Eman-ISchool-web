import { config } from '../../config';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// Public STUN servers (always included)
const STUN_SERVERS: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function getIceServers(): IceServer[] {
  const servers: IceServer[] = [...STUN_SERVERS];

  if (config.turn.enabled && config.turn.urls.length > 0) {
    servers.push({
      urls: config.turn.urls,
      username: config.turn.username,
      credential: config.turn.credential,
    });
  }

  return servers;
}

export function hasRelay(): boolean {
  return config.turn.enabled;
}
