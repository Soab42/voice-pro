/*
 * Telnyx service.
 *
 * Provides helper functions for interacting with the Telnyx Voice API.
 * Each function returns a promise that resolves to the API response
 * JSON body or throws an error if the request fails. The API key
 * and other settings are pulled from environment variables.
 */

const fetch = require('node-fetch');

const TELNYX_BASE = 'https://api.telnyx.com/v2';

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${TELNYX_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Initiates a call to the given number. Optionally specify a 'from'
// caller ID and connection ID. Returns the Telnyx call object.
async function dial({ to, from, connection_id }) {
  const body = {
    to,
    from: from || process.env.TELNYX_ANI,
    connection_id: connection_id || process.env.TELNYX_CONNECTION_ID,
  };
  return request('/calls', { method: 'POST', body: JSON.stringify(body) });
}

// Answers an incoming call given a call_control_id
async function answer(callControlId) {
  return request(`/calls/${callControlId}/actions/answer`, { method: 'POST' });
}

// Hangs up a call given a call_control_id
async function hangup(callControlId) {
  return request(`/calls/${callControlId}/actions/hangup`, { method: 'POST' });
}

// Bridges two call legs together
async function bridge(callControlIdA, callControlIdB) {
  const body = { call_control_id: callControlIdB };
  return request(`/calls/${callControlIdA}/actions/bridge`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Starts recording on a live call
async function startRecording(callControlId, options = {}) {
  const body = { channels: 'dual', ...options };
  return request(`/calls/${callControlId}/actions/record_start`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Starts the built‑in Telnyx AI assistant on a call
async function startAI(callControlId, config = {}) {
  return request(`/calls/${callControlId}/actions/ai_assistant_start`, {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

// Starts media streaming (bi‑directional) for custom AI
async function startStreaming(callControlId, streamUrl) {
  const body = { stream_url: streamUrl, bidirectional: true };
  return request(`/calls/${callControlId}/actions/streaming_start`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Joins an existing conference or call with supervisor role settings. Not all
// parameters are required; the Telnyx API will create a new conference
// automatically if needed. You can specify supervisor_role: 'monitor',
// 'whisper', or 'barge' and whisper_to for whispering to specific legs.
async function joinConference(conferenceId, callControlId, options = {}) {
  const body = { call_control_id: callControlId, ...options };
  return request(`/conferences/${conferenceId}/actions/join`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Switches supervisor role on a call or conference participant
async function switchRole(callControlId, options = {}) {
  return request(`/calls/${callControlId}/actions/switch_supervisor_role`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

module.exports = {
  dial,
  answer,
  hangup,
  bridge,
  startRecording,
  startAI,
  startStreaming,
  joinConference,
  switchRole,
};