import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bot, Clock, Phone } from 'lucide-react';
import { getCallHistoryByNumber, Call as ApiCall } from '../../../lib/api';

interface AiAssistantSidebarProps {
  customerNumber: string;
  aiUpdates: any[];
}

const AiAssistantSidebar: React.FC<AiAssistantSidebarProps> = ({ customerNumber, aiUpdates }) => {
    const [history, setHistory] = useState<ApiCall[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  useEffect(() => {
    if (!customerNumber) return;

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const historyData = await getCallHistoryByNumber(customerNumber);
        if (isMounted) {
          setHistory(historyData);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorHistory(err.message || 'Failed to fetch customer history');
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [customerNumber]);

    const transcriptions = aiUpdates.filter(update => update.type === 'transcription');
  const suggestions = aiUpdates.filter(update => update.type === 'suggestion');
  return (
    <div className="w-80 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-purple-600" />
            AI Assistant
          </CardTitle>
        </CardHeader>
                <CardContent className="space-y-3">
          {transcriptions.length === 0 && <p className="text-sm text-gray-500">No transcriptions yet...</p>}
          {transcriptions.map((update, index) => (
            <div key={index} className="text-sm">
              <span className={`font-semibold ${update.data.speaker === 'agent' ? 'text-blue-600' : 'text-green-600'}`}>
                {update.data.speaker === 'agent' ? 'Agent' : 'Customer'}:
              </span>
              <p className="text-gray-700">{update.data.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

            <Card>
        <CardHeader>
          <CardTitle>Customer History</CardTitle>
        </CardHeader>
        <CardContent>
                    {loadingHistory && <p>Loading history...</p>}
                    {errorHistory && <p className="text-red-500">{errorHistory}</p>}
                    {!loadingHistory && !errorHistory && history.length === 0 && <p>No past calls found.</p>}
          <div className="space-y-3">
            {history.map((call) => (
              <div key={call.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${call.status === 'COMPLETED' ? '' : 'text-gray-500'}`}>
                    {call.direction === 'inbound' ? 'Inbound' : 'Outbound'} Call
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(call.startedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script Suggestions</CardTitle>
        </CardHeader>
                <CardContent className="space-y-2">
          {suggestions.length === 0 && <p className="text-sm text-gray-500">No suggestions yet...</p>}
          {suggestions.map((update, index) => (
            <div key={index} className="text-sm p-2 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-gray-700">{update.data.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiAssistantSidebar;
