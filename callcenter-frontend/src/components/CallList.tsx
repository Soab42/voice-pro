"use client";

import { useState } from 'react';
import { apiFetch } from '../lib/api';

interface Call {
  id: string;
  customerNumber: string;
  status: string;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
}

interface Props {
  calls: Call[];
  role: string;
  token: string | null;
  refresh?: () => void;
}

export default function CallList({ calls, role, token, refresh }: Props) {
  const [actionError, setActionError] = useState<string | null>(null);

  const handleHangup = async (callId: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/calls/${callId}/hangup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refresh) refresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleSupervisorAction = async (callId: string, action: 'monitor' | 'whisper' | 'barge') => {
    if (!token) return;
    const endpoint = `/api/supervisor/${callId}/${action}`;
    try {
      await apiFetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          // supervisorCallControlId must be provided by the supervisor; this is left blank as a stub
          supervisorCallControlId: 'SUPERVISOR_CALL_CONTROL_ID',
          whisperTo: null,
        }),
      });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Active Calls</h2>
      {actionError && <div className="text-red-500 text-sm mb-2">{actionError}</div>}
      <div className="space-y-2">
        {calls.length === 0 && <div className="text-sm text-gray-500">No active calls</div>}
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between border rounded-md p-3"
          >
            <div>
              <div className="font-medium">{call.customerNumber}</div>
              <div className="text-xs text-gray-500">Status: {call.status}</div>
            </div>
            <div className="flex gap-2">
              {/* Hangup button for agents and supervisors */}
              {['AGENT', 'SUPERVISOR', 'ADMIN'].includes(role) && (
                <button
                  onClick={() => handleHangup(call.id)}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                >
                  Hang up
                </button>
              )}
              {/* Supervisor controls if role is SUPERVISOR or ADMIN */}
              {['SUPERVISOR', 'ADMIN'].includes(role) && (
                <>
                  <button
                    onClick={() => handleSupervisorAction(call.id, 'monitor')}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                  >
                    Listen
                  </button>
                  <button
                    onClick={() => handleSupervisorAction(call.id, 'whisper')}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                  >
                    Whisper
                  </button>
                  <button
                    onClick={() => handleSupervisorAction(call.id, 'barge')}
                    className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                  >
                    Barge
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}