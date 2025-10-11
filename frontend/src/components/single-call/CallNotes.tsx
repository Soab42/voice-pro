import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface CallNotesProps {
  callNotes: string;
  setCallNotes: (notes: string) => void;
}

const CallNotes: React.FC<CallNotesProps> = ({ callNotes, setCallNotes }) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Call Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          placeholder="Enter call notes and customer feedback..."
          className="min-h-[200px] w-full"
        />
      </CardContent>
    </Card>
  );
};

export default CallNotes;
