// =============================================
// Telnyx WebRTC React Setup (Production-Ready)
// =============================================
// This file bundles a minimal yet robust setup using:
// - A singleton Telnyx client
// - A React hook for call lifecycle
// - A sample component showing how to render & control a live call
//
// You can split these sections into real files in your project:
//   src/lib/telnyxClient.ts
//   src/hooks/useTelnyxCall.ts
//   src/components/CallView.tsx
//
// Prereqs:
//   npm i @telnyx/webrtc
//   Run on HTTPS. Provide a short-lived login_token (JWT) from your backend.
//
// =============================================
// src/lib/telnyxClient.ts
// =============================================

import { TelnyxRTC } from "@telnyx/webrtc";

let _client: TelnyxRTC | null = null;

export type TelnyxLoginTokenProvider = () => Promise<string> | string;

// Create (or return) a singleton client
export const getTelnyxClient = async (getLoginToken: TelnyxLoginTokenProvider): Promise<TelnyxRTC> => {
  if (_client) return _client;
  const token = await Promise.resolve(getLoginToken());
  if (!token) throw new Error("Missing Telnyx login token");
  _client = new TelnyxRTC({ login_token: token });
  return _client;
};

export const connectTelnyx = async (getLoginToken: TelnyxLoginTokenProvider): Promise<TelnyxRTC> => {
  const client = await getTelnyxClient(getLoginToken);
  if ((client as any).isConnected) return client; // SDK exposes isConnected on instance
  await client.connect();
  return client;
};

export const disconnectTelnyx = async (): Promise<void> => {
  if (_client) {
    try { await _client.disconnect(); } catch {}
    _client = null;
  }
};

// =============================================
// src/hooks/useTelnyxCall.ts
// =============================================
import { useCallback, useEffect, useRef, useState } from "react";

export type IncomingInvite = any; // Keep as any unless you import exact SDK types
export type TelnyxCall = any;

interface UseTelnyxCallOptions {
  // Provide a function that returns a fresh short-lived login_token (JWT)
  getLoginToken: TelnyxLoginTokenProvider;
  // Audio element ref to attach remote stream
  audioRef?: React.RefObject<HTMLAudioElement>;
  // Auto-accept incoming calls (for call center agent UX)
  autoAccept?: boolean;
}

interface UseTelnyxCallResult {
  client: TelnyxRTC | null;
  call: TelnyxCall | null;
  isMuted: boolean;
  isConnected: boolean;
  status: string; // "idle" | "ringing" | "active" | "ended" | etc.
  accept: (invite: IncomingInvite) => Promise<void>;
  hangup: () => Promise<void>;
  muteToggle: () => void;
}

export function useTelnyxCall(opts: UseTelnyxCallOptions): UseTelnyxCallResult {
  const { getLoginToken, audioRef, autoAccept = true } = opts;
  const [client, setClient] = useState<TelnyxRTC | null>(null);
  const [call, setCall] = useState<TelnyxCall | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const mountedRef = useRef(true);

  // Connect once
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const c = await connectTelnyx(getLoginToken);
        setClient(c);
      } catch (e) {
        console.error("Telnyx connect error", e);
      }
    })();
    return () => {
      mountedRef.current = false;
      // Optional: fully disconnect on unmount if this is your only Telnyx surface
      // disconnectTelnyx();
    };
  }, [getLoginToken]);

  // Handle SDK events
  useEffect(() => {
    if (!client) return;

    const onNotification = (n: any) => {
      // Common types: 'call.invite', 'callUpdate', 'telnyx.ready', 'error'
      if (n.type === 'telnyx.ready') {
        // Connected to signaling
      }
      if (n.type === 'error') {
        console.error("Telnyx error", n);
      }
      if (n.type === 'call.invite') {
        setStatus('ringing');
        if (autoAccept) accept(n.call);
      }
      if (n.type === 'callUpdate') {
        // n.call has latest state
        const c = n.call;
        setCall(c);
        // derive status from SDK call state
        if (c.state === 'active') setStatus('active');
        if (c.state === 'hangup' || c.state === 'destroyed') setStatus('ended');
      }
    };

    client.on('telnyx.notification', onNotification);

    return () => {
      client.off('telnyx.notification', onNotification);
    };
  }, [client, autoAccept]);

  // Attach remote stream when present
  const wireRemoteStream = useCallback((c: TelnyxCall) => {
    // Prefer the SDK event; some versions emit 'remote_stream'
    if (typeof c.on === 'function') {
      c.on('remote_stream', (stream: MediaStream) => {
        if (!audioRef?.current) return;
        audioRef.current.srcObject = stream;
        audioRef.current.setAttribute('playsinline', 'true');
        audioRef.current.play?.().catch(() => {
          // Show a UI hint: user must tap to start audio due to autoplay policy
          console.warn('Autoplay blocked: require user gesture to play audio');
        });
      });
      c.on('hangup', () => {
        if (audioRef?.current?.srcObject instanceof MediaStream) {
          (audioRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
          audioRef.current.srcObject = null;
        }
      });
    }
  }, [audioRef]);

  const accept = useCallback(async (invite: IncomingInvite) => {
    try {
      const c = await getTelnyxClient(getLoginToken);
      const answered = await invite.answer();
      setCall(answered);
      setStatus('active');
      wireRemoteStream(answered);
    } catch (e) {
      console.error('Accept error', e);
    }
  }, [getLoginToken, wireRemoteStream]);

  const hangup = useCallback(async () => {
    try {
      if (!call) return;
      await call.hangup?.();
      setStatus('ended');
      setCall(null);
      if (audioRef?.current?.srcObject instanceof MediaStream) {
        (audioRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        audioRef.current.srcObject = null;
      }
    } catch (e) {
      console.error('Hangup error', e);
    }
  }, [call, audioRef]);

  const muteToggle = useCallback(() => {
    if (!call) return;
    try {
      if (isMuted) {
        call.unmuteAudio?.() ?? call.unmute?.();
        setIsMuted(false);
      } else {
        call.muteAudio?.() ?? call.mute?.();
        setIsMuted(true);
      }
    } catch (e) {
      console.error('Mute toggle error', e);
    }
  }, [call, isMuted]);

  return { client, call, isMuted, isConnected: !!client, status, accept, hangup, muteToggle };
}

// =============================================
// src/components/CallView.tsx (example usage)
// =============================================
import React, { useMemo, useRef, useState } from "react";

export default function CallView() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Replace with your real token provider calling your backend
  const getLoginToken = useMemo(() => () => fetch("/api/telnyx/token").then(r => r.text()), []);

  const { status, isMuted, muteToggle, hangup } = useTelnyxCall({
    getLoginToken,
    audioRef,
    autoAccept: true,
  });

  const [duration, setDuration] = useState("00:00");
  const startTsRef = useRef<number | null>(null);

  // very basic duration ticker, starts when call becomes active
  React.useEffect(() => {
    let id: any;
    if (status === 'active' && startTsRef.current == null) {
      startTsRef.current = Date.now();
    }
    if (status === 'active') {
      id = setInterval(() => {
        const start = startTsRef.current ?? Date.now();
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        setDuration(`${m}:${s}`);
      }, 1000);
    } else {
      startTsRef.current = null;
      setDuration('00:00');
    }
    return () => clearInterval(id);
  }, [status]);

  return (
    <div className="p-4 space-y-4">
      <audio ref={audioRef as any} autoPlay playsInline />

      <div className="text-sm text-gray-600">Status: <b>{status}</b></div>
      <div className="text-sm text-gray-600">Duration: <b>{duration}</b></div>

      <div className="flex gap-2">
        <button
          onClick={muteToggle}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          disabled={status !== 'active'}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={hangup}
          className="px-3 py-2 rounded bg-red-500 text-white disabled:opacity-50"
          disabled={status !== 'active'}
        >
          Hang up
        </button>
      </div>

      {status !== 'active' && (
        <div className="text-xs text-gray-500">
          If audio doesn’t start automatically when a call connects, the browser may
          require a user gesture. Click anywhere in the page to allow audio.
        </div>
      )}
    </div>
  );
}

// =============================================
// Notes & Integration Guide
// =============================================
// 1) Token flow: getLoginToken must return a short-lived Telnyx WebRTC login_token (JWT) per agent.
//    - Create an API route (/api/telnyx/token) on your server that returns a fresh token for the current user.
//    - Avoid long-lived tokens in localStorage; prefer memory or sessionStorage if needed.
//
// 2) Events you may want to handle:
//    - 'telnyx.ready' (signaling connected)
//    - 'telnyx.error' (auth/network issues)
//    - 'call.invite' (incoming call)
//    - 'callUpdate' (state changes like ringing/active/hold/hangup)
//
// 3) Audio policies:
//    - Use <audio playsInline autoPlay>. On iOS/Safari, you may still need a user action before play().
//    - Provide a visible "Tap to enable audio" fallback if play() is rejected.
//
// 4) Cleanup:
//    - On hangup or unmount, stop tracks and clear srcObject.
//
// 5) Outbound calls (optional):
//    - Depending on your flow, use the SDK to create a call (e.g., client.newCall / dial), then attach 'remote_stream'.
//
// 6) Device management (optional):
//    - Enumerate devices with navigator.mediaDevices.enumerateDevices().
//    - Use HTMLMediaElement.setSinkId to route audio to a specific output (Chrome/Edge).
//
// 7) Reliability:
//    - Consider reconnect logic on network changes; you can re-run connectTelnyx(getLoginToken) on visibilitychange/online.
//
// This setup is intentionally minimal but production-safe: singleton client, event-driven media wiring,
// proper cleanup, and extensibility for outbound calling and device selection.
