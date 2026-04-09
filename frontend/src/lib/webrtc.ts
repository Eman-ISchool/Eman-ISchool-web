// ─── ICE Server Configuration ───────────────────────────────────

// Default STUN servers (always available)
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// Fetch ICE servers from backend (includes TURN if configured)
let cachedIceServers: RTCIceServer[] | null = null;

export async function fetchIceServers(token: string): Promise<RTCIceServer[]> {
  if (cachedIceServers) return cachedIceServers;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/ice-servers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      cachedIceServers = data.iceServers;
      return cachedIceServers!;
    }
  } catch (err) {
    console.warn('[WebRTC] Failed to fetch ICE servers, using defaults');
  }

  return DEFAULT_ICE_SERVERS;
}

// ─── Callback Types ─────────────────────────────────────────────

export interface WebRTCCallbacks {
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onIceCandidate: (
    peerId: string,
    candidate: RTCIceCandidate,
  ) => void;
  onConnectionStateChange: (
    peerId: string,
    state: RTCPeerConnectionState,
  ) => void;
}

// ─── WebRTC Manager ─────────────────────────────────────────────

export class WebRTCManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private callbacks: WebRTCCallbacks;
  private iceServers: RTCIceServer[];

  constructor(callbacks: WebRTCCallbacks, iceServers?: RTCIceServer[]) {
    this.callbacks = callbacks;
    this.iceServers = iceServers || DEFAULT_ICE_SERVERS;
  }

  setIceServers(servers: RTCIceServer[]): void {
    this.iceServers = servers;
  }

  createPeerConnection(peerId: string): RTCPeerConnection {
    // Close existing connection for this peer if any
    this.closeConnection(peerId);

    const pc = new RTCPeerConnection({ iceServers: this.iceServers });

    // Add local tracks if available
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream);
      }
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.callbacks.onRemoteStream(peerId, remoteStream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onIceCandidate(peerId, event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      this.callbacks.onConnectionStateChange(peerId, pc.connectionState);

      // Clean up failed/closed connections
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed'
      ) {
        this.peers.delete(peerId);
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  addLocalStream(stream: MediaStream): void {
    this.localStream = stream;

    // Add tracks to all existing peer connections
    for (const [, pc] of this.peers) {
      const senders = pc.getSenders();
      for (const track of stream.getTracks()) {
        const existingSender = senders.find(
          (s) => s.track?.kind === track.kind,
        );
        if (existingSender) {
          existingSender.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      }
    }
  }

  async handleOffer(
    peerId: string,
    sdp: string,
  ): Promise<RTCSessionDescriptionInit> {
    let pc = this.peers.get(peerId);
    if (!pc) {
      pc = this.createPeerConnection(peerId);
    }

    await pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    return answer;
  }

  async handleAnswer(peerId: string, sdp: string): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) {
      console.warn(`No peer connection found for ${peerId} when handling answer`);
      return;
    }

    await pc.setRemoteDescription({ type: 'answer', sdp });
  }

  async handleIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit,
  ): Promise<void> {
    const pc = this.peers.get(peerId);
    if (!pc) {
      console.warn(
        `No peer connection found for ${peerId} when handling ICE candidate`,
      );
      return;
    }

    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  closeConnection(peerId: string): void {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
  }

  closeAll(): void {
    for (const [peerId, pc] of this.peers) {
      pc.close();
      this.peers.delete(peerId);
    }
    this.localStream = null;
  }

  getPeerConnection(peerId: string): RTCPeerConnection | undefined {
    return this.peers.get(peerId);
  }

  get peerCount(): number {
    return this.peers.size;
  }
}
