import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Bot,
  AlertCircle,
  Calendar as CalendarIcon,
  TrendingUp,
} from 'lucide-react';

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <Bot className="mr-2 h-4 w-4" />
          Issue 10% Refund
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <AlertCircle className="mr-2 h-4 w-4" />
          Escalate to Manager
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule Follow-up
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <TrendingUp className="mr-2 h-4 w-4" />
          Offer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
