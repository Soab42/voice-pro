import React from 'react';
import { Phone } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Call as ApiCall } from '../../../lib/api';

interface CallHeaderProps {
  call: ApiCall;
  callDuration: string;
}

const CallHeader: React.FC<CallHeaderProps> = ({ call, callDuration }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl">{call.agent?.name || 'Unknown Agent'}</h2>
            <p className="text-gray-600">{call.customerNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl">{callDuration}</p>
          <p className="text-gray-600">Call Duration</p>
        </div>
      </div>
    </div>
  );
};

export default CallHeader;
