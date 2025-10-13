import { TelnyxRTC } from "@telnyx/webrtc";

let client: TelnyxRTC | null = null;
let call: any | null = null;

export const initTelnyxClient = async () => {
  try {
    if (client) {
      console.log("Returning existing Telnyx client");
      return client;
    }

    const token = localStorage.getItem("telnyxToken"); // You need to get a Telnyx token for the user
    if (!token) {
      throw new Error("Telnyx token not found");
    }

    client = new TelnyxRTC({ login_token: token });
    console.log("Telnyx client initialized successfully", client);
    return client;
  } catch (error) {
    console.error("Error initializing Telnyx client:", error);
    throw error;
  }
};

export const connectTelnyxClient = async () => {
  try {
    const client = await initTelnyxClient();
    await client.connect();
    console.log("Telnyx client connected successfully");
  } catch (error) {
    console.error("Error connecting Telnyx client:", error);
    throw error;
  }
};

export const getTelnyxCall = () => {
  return call;
};

export const acceptTelnyxCall = async (invitation: any) => {
  try {
    const client = await initTelnyxClient();
    call = invitation.answer();
    console.log("Telnyx call accepted successfully");
    return call;
  } catch (error) {
    console.error("Error accepting Telnyx call:", error);
    throw error;
  }
};
