import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import { Button } from './ui/button';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hangupCall } from '../../lib/api';

export function CallNotification() {
  const { incomingCall, setIncomingCall } = useCall();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (incomingCall && !audioRef.current) {
      audioRef.current = new Audio('/phone-ringtone-penthouse-357397.mp3');
      audioRef.current.loop = true;
      audioRef.current.play();
    } else if (!incomingCall && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [incomingCall]);

  const handleAnswer = () => {
    if (incomingCall) {
      navigate(`/call/${incomingCall.id}`);
      setIncomingCall(null);
    }
  };

  const handleReject = async () => {
    if (incomingCall) {
      try {
        await hangupCall(incomingCall.id);
      } catch (error) {
        console.error('Failed to hangup call', error);
      }
      setIncomingCall(null);
    }
  };

  if (!incomingCall) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden min-w-[340px]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">Incoming Call</p>
              <p className="text-xl font-semibold text-gray-900 truncate">
                {incomingCall.customerNumber}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReject}
              className="flex-1 h-14 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Decline
            </Button>
            
            <Button
              size="lg"
              onClick={handleAnswer}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Phone className="h-5 w-5 mr-2" />
              Answer
            </Button>
          </div>
        </div>

        {/* Decorative bottom accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </div>
    </div>
  );
}