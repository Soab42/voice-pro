"use client";

import { useState } from 'react';
import { apiFetch } from '../lib/api';

interface Props {
  token: string | null;
}

export default function CampaignManager({ token }: Props) {
  const [name, setName] = useState('');
  const [numbersInput, setNumbersInput] = useState('');
  const [concurrency, setConcurrency] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!token) return;
    const numbers = numbersInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s);
    if (numbers.length === 0) {
      setError('Please enter at least one phone number');
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch<{ id: string }>('/api/campaign/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, numbers, concurrency }),
      });
      setMessage(`Campaign started with id ${res.id}`);
      setName('');
      setNumbersInput('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Start Campaign</h2>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="campaignName">Name</label>
          <input
            id="campaignName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="numbers">Numbers (comma or newline separated)</label>
          <textarea
            id="numbers"
            value={numbersInput}
            onChange={(e) => setNumbersInput(e.target.value)}
            placeholder="+12025550123, +12025550124"
            className="w-full border p-2 rounded-md h-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="concurrency">Concurrency</label>
          <input
            id="concurrency"
            type="number"
            min={1}
            value={concurrency}
            onChange={(e) => setConcurrency(parseInt(e.target.value) || 1)}
            className="w-full border p-2 rounded-md"
          />
        </div>
        <button
          onClick={handleStart}
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
        >
          Start Campaign
        </button>
      </div>
    </div>
  );
}