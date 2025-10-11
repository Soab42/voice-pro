import React from 'react';
import { Button } from '../ui/button';
import {
  PhoneOff,
  Mic,
  MicOff,
  PauseCircle,
  Hash,
  Volume2,
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  toggleMute: () => void;
  handleEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({ isMuted, toggleMute, handleEndCall }) => {
  return (
    <div className="mt-6 flex items-center justify-center space-x-4">
      <Button
        variant={isMuted ? 'destructive' : 'secondary'}
        size="lg"
        className="rounded-full w-16 h-16"
        onClick={toggleMute}
      >
        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>

      <Button variant="secondary" size="lg" className="rounded-full w-16 h-16">
        <PauseCircle className="h-6 w-6" />
      </Button>

      <Button
        variant="destructive"
        size="lg"
        className="rounded-full w-20 h-20"
        onClick={handleEndCall}
      >
        <PhoneOff className="h-8 w-8" />
      </Button>

      <Button variant="secondary" size="lg" className="rounded-full w-16 h-16">
        <Hash className="h-6 w-6" />
      </Button>

      <Button variant="secondary" size="lg" className="rounded-full w-16 h-16">
        <Volume2 className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CallControls;
