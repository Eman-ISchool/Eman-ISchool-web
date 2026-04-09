import type {
  CreateSessionResponse,
  GuestSession,
  JoinQueueResponse,
  CreatePrivateRoomResponse,
  JoinPrivateRoomResponse,
  Room,
  RoomStateResponse,
  DrinkType,
} from '../../../shared/types';
import { ApiRoutes } from '../../../shared/constants';

// ─── Configuration ──────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const TOKEN_STORAGE_KEY = 'coffee_session_token';

// ─── Token Management ───────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ─── HTTP Helpers ───────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const authToken = token ?? getStoredToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorCode: string | undefined;
    try {
      const body = await response.json();
      errorMessage = body.message ?? body.error ?? errorMessage;
      errorCode = body.code;
    } catch {
      // body was not JSON, keep statusText
    }
    throw new ApiError(response.status, errorMessage, errorCode);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── API Functions ──────────────────────────────────────────────

export async function createSession(
  nickname: string,
): Promise<CreateSessionResponse> {
  const data = await request<CreateSessionResponse>(
    ApiRoutes.CREATE_SESSION,
    {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    },
  );
  storeToken(data.token);
  return data;
}

export async function getSession(
  token?: string,
): Promise<GuestSession> {
  return request<GuestSession>(
    ApiRoutes.GET_SESSION,
    { method: 'GET' },
    token,
  );
}

export async function joinQueue(
  token: string,
  drinkType: DrinkType,
  topic: string,
): Promise<JoinQueueResponse> {
  return request<JoinQueueResponse>(
    ApiRoutes.JOIN_QUEUE,
    {
      method: 'POST',
      body: JSON.stringify({ drinkType, topic }),
    },
    token,
  );
}

export async function leaveQueue(token: string): Promise<void> {
  return request<void>(
    ApiRoutes.LEAVE_QUEUE,
    { method: 'POST' },
    token,
  );
}

export async function createPrivateRoom(
  token: string,
  drinkType: DrinkType,
  topic: string,
  maxParticipants?: number,
): Promise<CreatePrivateRoomResponse> {
  return request<CreatePrivateRoomResponse>(
    ApiRoutes.CREATE_PRIVATE_ROOM,
    {
      method: 'POST',
      body: JSON.stringify({ drinkType, topic, maxParticipants }),
    },
    token,
  );
}

export async function joinPrivateRoom(
  token: string,
  inviteCode: string,
): Promise<JoinPrivateRoomResponse> {
  return request<JoinPrivateRoomResponse>(
    ApiRoutes.JOIN_PRIVATE_ROOM,
    {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    },
    token,
  );
}

export async function getRoom(
  token: string,
  roomId: string,
): Promise<Room> {
  const path = ApiRoutes.GET_ROOM.replace(':id', roomId);
  return request<Room>(path, { method: 'GET' }, token);
}

export async function getRoomState(
  token: string,
  roomId: string,
): Promise<RoomStateResponse> {
  const path = ApiRoutes.GET_ROOM_STATE.replace(':id', roomId);
  return request<RoomStateResponse>(path, { method: 'GET' }, token);
}

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>(ApiRoutes.HEALTH, {
    method: 'GET',
  });
}

export async function getIceServers(
  token: string,
): Promise<{ iceServers: RTCIceServer[] }> {
  return request<{ iceServers: RTCIceServer[] }>(
    '/api/ice-servers',
    { method: 'GET' },
    token,
  );
}
