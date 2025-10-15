import { useCallback, useEffect, useRef, useState } from "react";
import { connectTelnyx, getTelnyxClient } from "../../lib/telnyx";
import React from "react";
import { TelnyxRTC } from "@telnyx/webrtc";

export type IncomingInvite = any; // Keep as any unless you import exact SDK types
export type TelnyxCall = any;

interface UseTelnyxCallOptions {
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
  makeCall: (destination: string) => Promise<void>;
}

export function useTelnyxCall(opts: UseTelnyxCallOptions): UseTelnyxCallResult {
  const { audioRef, autoAccept = true } = opts;
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
        const c = await connectTelnyx();
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
  }, []);

  // Handle SDK events
  useEffect(() => {
    if (!client) return;

    const onNotification = (n: any) => {
      // Common types: 'call.invite', 'callUpdate', 'telnyx.ready', 'error'
      if (n.type === "telnyx.ready") {
        // Connected to signaling
      }
      if (n.type === "error") {
        console.error("Telnyx error", n);
      }
      if (n.type === "call.invite") {
        setStatus("ringing");
        if (autoAccept) accept(n.call);
      }
      if (n.type === "callUpdate") {
        // n.call has latest state
        const c = n.call;
        setCall(c);
        // derive status from SDK call state
        if (c.state === "active") setStatus("active");
        if (c.state === "hangup" || c.state === "destroyed") setStatus("ended");
      }
    };

    client.on("telnyx.notification", onNotification);

    return () => {
      client.off("telnyx.notification", onNotification);
    };
  }, [client, autoAccept]);

  // Attach remote stream when present
  const wireRemoteStream = useCallback(
    (c: TelnyxCall) => {
      // Prefer the SDK event; some versions emit 'remote_stream'
      if (typeof c.on === "function") {
        c.on("remote_stream", (stream: MediaStream) => {
          if (!audioRef?.current) return;
          audioRef.current.srcObject = stream;
          audioRef.current.setAttribute("playsinline", "true");
          audioRef.current.play?.().catch(() => {
            // Show a UI hint: user must tap to start audio due to autoplay policy
            console.warn(
              "Autoplay blocked: require user gesture to play audio"
            );
          });
        });
        c.on("hangup", () => {
          if (audioRef?.current?.srcObject instanceof MediaStream) {
            (audioRef.current.srcObject as MediaStream)
              .getTracks()
              .forEach((t) => t.stop());
            audioRef.current.srcObject = null;
          }
        });
      }
    },
    [audioRef]
  );

  const accept = useCallback(
    async (invite: IncomingInvite) => {
      try {
        const c = await getTelnyxClient();
        const answered = await invite.answer();
        setCall(answered);
        setStatus("active");
        wireRemoteStream(answered);
      } catch (e) {
        console.error("Accept error", e);
      }
    },
    [wireRemoteStream]
  );

  const hangup = useCallback(async () => {
    try {
      if (!call) return;
      await call.hangup?.();
      setStatus("ended");
      setCall(null);
      if (audioRef?.current?.srcObject instanceof MediaStream) {
        (audioRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        audioRef.current.srcObject = null;
      }
    } catch (e) {
      console.error("Hangup error", e);
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
      console.error("Mute toggle error", e);
    }
  }, [call, isMuted]);

  const makeCall = useCallback(
    async (destination: string) => {
      if (!client) return;
      try {
        const newCall = client.newCall({ destinationNumber: destination });
        setCall(newCall);
        wireRemoteStream(newCall);
      } catch (e) {
        console.error("Make call error", e);
      }
    },
    [client, wireRemoteStream]
  );

  return {
    client,
    call,
    isMuted,
    isConnected: !!client,
    status,
    accept,
    hangup,
    muteToggle,
    makeCall,
  };
}
