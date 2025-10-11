"use client";

import { useState } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  token: string | null;
  refresh?: () => void;
}

export default function Dialer({ token, refresh }: Props) {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleDial = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetch('/api/calls', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: number }),
      });
      setSuccess(true);
      setNumber('');
      if (refresh) refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">Outbound Call</h2>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">Call initiated!</div>}
      <div className="flex flex-col items-center">
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter phone number"
          className="w-full text-center text-2xl mb-4 p-2 rounded-md border"
        />
        <div className="grid grid-cols-3 gap-4">
          {[...'123456789*0#'].map((char) => (
            <button
              key={char}
              onClick={() => setNumber(number + char)}
              className="text-2xl w-16 h-16 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              {char}
            </button>
          ))}
          <button
            onClick={() => setNumber(number.slice(0, -1))}
            className="text-2xl w-16 h-16 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            &larr;
          </button>
        </div>
        <button
          onClick={handleDial}
          disabled={loading || !number}
          className="mt-4 px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 text-2xl"
        >
          {loading ? 'Dialing...' : 'Call'}
        </button>
      </div>
    </div>
  );
}