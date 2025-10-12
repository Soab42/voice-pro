"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import CallList from '../../components/CallList';
import Dialer from '../../components/Dialer';
import CampaignManager from '../../components/CampaignManager';

interface Call {
  id: string;
  customerNumber: string;
  status: string;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      // no user loaded yet or not authenticated; but we can't call router here because of hydration; we wait
      router.push('/login');
    }
  }, [user, router]);

  // Fetch initial active calls and subscribe to real‑time updates
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const fetchCalls = async () => {
      try {
        const data = await apiFetch<Call[]>('/api/calls/active', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setCalls(data);
      } catch (err) {
        // ignore
      }
    };
    fetchCalls();
    const socket = getSocket();
    const handleUpdate = (payload: any) => {
      setCalls((prev) => {
        const idx = prev.findIndex((c) => c.id === payload.id);
        if (idx === -1) return [...prev, payload];
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...payload };
        return updated;
      });
    };
    socket.on('callUpdate', handleUpdate);
    return () => {
      mounted = false;
      socket.off('callUpdate', handleUpdate);
    };
  }, [token]);

  // Refresh calls manually
  const refresh = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Call[]>('/api/calls/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCalls(data);
    } catch (err) {
      // ignore
    }
  };

  if (!user) {
    // show nothing until user loads
    return null;
  }

  const activeCount = calls.filter((c) => c.status !== 'COMPLETED' && c.status !== 'FAILED' && c.status !== 'NO_ANSWER').length;

  return (
    <div className="h-screen flex flex-col max-w-5xl mx-auto">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.role}</span>
          <button onClick={logout} className="px-3 py-1 rounded-md border hover:bg-gray-100">Logout</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Supervisor or Admin campaign manager */}
          {['SUPERVISOR', 'ADMIN'].includes(user.role) && <CampaignManager token={token} />}
          {/* Call list for all roles */}
          <CallList calls={calls} role={user.role} token={token} refresh={refresh} />
        </div>

        {/* Dialer area */}
        <div className="w-80 border-l p-4 flex flex-col">
          <div className="mt-2 text-sm text-gray-600">Active calls: {activeCount}</div>
          <div className="flex-1" />
          <Dialer token={token} refresh={refresh} />
        </div>
      </main>
    </div>
  );
}