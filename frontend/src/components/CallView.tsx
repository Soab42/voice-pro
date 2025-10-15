import React, { useRef, useState } from "react";
import { useTelnyxCall } from "../hooks/useCallingSetup";

export default function CallView() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { status, isMuted, muteToggle, hangup, makeCall } = useTelnyxCall({
    audioRef,
    autoAccept: true,
  });

  const [duration, setDuration] = useState("00:00");
  const startTsRef = useRef<number | null>(null);
  const [destination, setDestination] = useState("");

  // very basic duration ticker, starts when call becomes active
  React.useEffect(() => {
    let id: any;
    if (status === "active" && startTsRef.current == null) {
      startTsRef.current = Date.now();
    }
    if (status === "active") {
      id = setInterval(() => {
        const start = startTsRef.current ?? Date.now();
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const m = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0");
        const s = (elapsed % 60).toString().padStart(2, "0");
        setDuration(`${m}:${s}`);
      }, 1000);
    } else {
      startTsRef.current = null;
      setDuration("00:00");
    }
    return () => clearInterval(id);
  }, [status]);

  const handleCall = () => {
    if (destination) {
      makeCall(destination);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <audio ref={audioRef as any} autoPlay playsInline />

      <div className="text-sm text-gray-600">
        Status: <b>{status}</b>
      </div>
      <div className="text-sm text-gray-600">
        Duration: <b>{duration}</b>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter number to call"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300"
        />
        <button
          onClick={handleCall}
          className="px-3 py-2 rounded bg-green-500 text-white disabled:opacity-50"
          disabled={status === "active" || !destination}
        >
          Call
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={muteToggle}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          disabled={status !== "active"}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={hangup}
          className="px-3 py-2 rounded bg-red-500 text-white disabled:opacity-50"
          disabled={status !== "active"}
        >
          Hang up
        </button>
      </div>

      {status !== "active" && (
        <div className="text-xs text-gray-500">
          If audio doesn’t start automatically when a call connects, the browser
          may require a user gesture. Click anywhere in the page to allow audio.
        </div>
      )}
    </div>
  );
}
