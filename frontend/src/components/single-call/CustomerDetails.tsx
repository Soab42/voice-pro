import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Call as ApiCall } from '../../../lib/api';

interface CustomerDetailsProps {
  call: ApiCall;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ call }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Email:</span>
          <span>{call.agent?.email || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Direction:</span>
          <span>{call.direction}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span>{call.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Started:</span>
          <span>{new Date(call.startedAt).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
