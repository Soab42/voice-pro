import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCall, hangupCall, Call as ApiCall } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import CallHeader from "./single-call/CallHeader";
import CustomerDetails from "./single-call/CustomerDetails";
import QuickActions from "./single-call/QuickActions";
import CallNotes from "./single-call/CallNotes";
import CallControls from "./single-call/CallControls";
import AiAssistantSidebar from "./single-call/AiAssistantSidebar";
import {
  connectTelnyxClient,
  acceptTelnyxCall,
  getTelnyxCall,
  initTelnyxClient,
} from "../../lib/telnyx";

const SingleCall = () => {
  const navigate = useNavigate();
  const { id: callId } = useParams<{ id: string }>();
  const [call, setCall] = useState<ApiCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [callDuration, setCallDuration] = useState("00:00");
  const [aiUpdates, setAiUpdates] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [telnyxCall, setTelnyxCall] = useState<any | null>(null);

  useEffect(() => {
    connectTelnyxClient();
  }, []);

  useEffect(() => {
    if (!callId) {
      navigate("/");
      return;
    }

    let isMounted = true;

    const fetchCall = async () => {
      try {
        setLoading(true);
        const callData = await getCall(callId);
        if (isMounted) {
          setCall(callData);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch call details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCall();

    const socket = getSocket();

    const handleAiUpdate = (update: any) => {
      if (update.callId === callId) {
        setAiUpdates((prevUpdates) => [...prevUpdates, update]);
      }
    };

    const handleCallUpdate = (update: any) => {
      if (update.id === callId) {
        setCall((prevCall) =>
          prevCall ? { ...prevCall, status: update.status } : null
        );
      }
    };

    socket.on("ai.update", handleAiUpdate);
    socket.on("callUpdate", handleCallUpdate);

    return () => {
      isMounted = false;
      socket.off("ai.update", handleAiUpdate);
      socket.off("callUpdate", handleCallUpdate);
    };
  }, [callId, navigate]);

  useEffect(() => {
    if (!call) return;

    const timer = setInterval(() => {
      const start = new Date(call.answeredAt || call.startedAt).getTime();
      const now = Date.now();
      const seconds = Math.floor((now - start) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setCallDuration(
        `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [call]);

  useEffect(() => {
    const client = initTelnyxClient();
    client.on("telnyx.notification", (notification: any) => {
      if (notification.type === "call.invite") {
        acceptTelnyxCall(notification.call);
      }
    });
  }, []);

  useEffect(() => {
    if (call?.status === "ACTIVE") {
      const telnyxCall = getTelnyxCall();
      if (telnyxCall) {
        setTelnyxCall(telnyxCall);
        telnyxCall.remoteStream.getAudioTracks().forEach((track) => {
          if (audioRef.current) {
            audioRef.current.srcObject = new MediaStream([track]);
          }
        });
      }
    }
  }, [call]);

  if (loading) {
    return <div>Loading call...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!call) {
    return <div>Call not found.</div>;
  }

  const handleEndCall = async () => {
    if (callId) {
      try {
        await hangupCall(callId);
      } catch (err) {}
    }
    navigate("/");
  };

  return (
    <div className="bg-white z-50 p-6">
      <audio ref={audioRef} autoPlay />
      <div className="h-full flex">
        <div className="flex-1 mr-6">
          <CallHeader call={call} callDuration={callDuration} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CustomerDetails call={call} />
            <QuickActions />
          </div>
          <CallNotes callNotes={callNotes} setCallNotes={setCallNotes} />
          <CallControls
            isMuted={isMuted}
            toggleMute={() => {
              if (telnyxCall) {
                if (isMuted) {
                  telnyxCall.unmute();
                } else {
                  telnyxCall.mute();
                }
                setIsMuted(!isMuted);
              }
            }}
            handleEndCall={handleEndCall}
          />
        </div>
        <AiAssistantSidebar
          customerNumber={call.customerNumber}
          aiUpdates={aiUpdates}
        />
      </div>
    </div>
  );
};
export default SingleCall;
