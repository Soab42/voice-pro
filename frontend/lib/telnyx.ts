import { TelnyxRTC } from '@telnyx/webrtc';

let client: TelnyxRTC | null = null;
let call: any | null = null;

export const initTelnyxClient = async () => {
  if (client) {
    return client;
  }

  const token = localStorage.getItem('telnyxToken'); // You need to get a Telnyx token for the user
  if (!token) {
    throw new Error('Telnyx token not found');
  }

  client = new TelnyxRTC({ login_token: token });
  return client;
};

export const connectTelnyxClient = async () => {
  const client = await initTelnyxClient();
  if (client.supernetwork) {
    return;
  }
  await client.connect();
};

export const getTelnyxCall = () => {
  return call;
};

export const acceptTelnyxCall = async (invitation: any) => {
  const client = await initTelnyxClient();
  call = invitation.answer();
  return call;
};
