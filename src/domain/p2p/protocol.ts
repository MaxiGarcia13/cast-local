/** Shared signaling + transfer message types (browser + signaling server). */

export interface PeerInfo {
  id: string;
  name: string;
  device: string;
}

export interface FileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
}

/** Portable SDP shape (avoids relying on DOM lib in Node). */
export interface SessionDescription {
  type?: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

/** Portable ICE candidate shape. */
export interface IceCandidate {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export type ClientMessage
  = | { type: 'join-room'; roomId: string; name: string; device?: string }
    | { type: 'offer-transfer'; to: string; files: FileMeta[]; textPreview?: string | null }
    | { type: 'accept'; to: string }
    | { type: 'decline'; to: string }
    | { type: 'rtc-offer'; to: string; sdp: SessionDescription }
    | { type: 'rtc-answer'; to: string; sdp: SessionDescription }
    | { type: 'ice-candidate'; to: string; candidate: IceCandidate | null };

export type ServerMessage
  = | { type: 'welcome'; peer: PeerInfo; roomId: string }
    | { type: 'peers'; peers: PeerInfo[] }
    | { type: 'peer-joined'; peer: PeerInfo }
    | { type: 'peer-left'; id: string }
    | { type: 'offer-transfer'; from: string; files: FileMeta[]; textPreview?: string | null }
    | { type: 'accept'; from: string }
    | { type: 'decline'; from: string }
    | { type: 'rtc-offer'; from: string; sdp: SessionDescription }
    | { type: 'rtc-answer'; from: string; sdp: SessionDescription }
    | { type: 'ice-candidate'; from: string; candidate: IceCandidate | null }
    | { type: 'error'; message: string };

/** First JSON message sent over the WebRTC data channel. */
export interface TransferManifest {
  type: 'manifest';
  transferId: string;
  files: FileMeta[];
  hasText?: boolean;
}

/** Progress / control messages on the data channel (JSON strings). */
export type DataChannelControl
  = | TransferManifest
    | { type: 'text'; text: string }
    | { type: 'file-complete'; fileId: string }
    | { type: 'transfer-complete' }
    | { type: 'transfer-error'; message: string };
