# Call Center Backend

This repository contains an Express‑based backend service designed to power a full‑feature call‑center dashboard.  It integrates with the **Telnyx** Voice API to originate, answer and manage calls, handle inbound webhooks, and broadcast real‑time updates via Socket.IO.  The backend is intended to be paired with a web dashboard (such as the Next.js project in this solution) and a PostgreSQL database accessed through Prisma.

## Features

* **User Authentication** – Secure registration and login endpoints using bcrypt password hashing and JSON Web Tokens (JWT).  The middleware in `src/middleware/auth.js` verifies tokens and attaches the authenticated user to each request.

* **Outbound Calls** – Agents can initiate outbound calls using the `/api/calls` route.  Calls are stored in the database with their Telnyx call control ID and status (`INITIATED`, `RINGING`, `ACTIVE`, `COMPLETED`, etc.).

* **Inbound Call Handling** – The webhook endpoint at `/api/telnyx/webhook` listens for Telnyx events.  It auto‑answers inbound calls, starts the built‑in Telnyx AI assistant using a configurable prompt, and updates call records as events arrive (e.g., `call.initiated`, `call.answered`, `call.hangup`).  Real‑time call status changes are broadcast via Socket.IO.

* **AI Integration** – On inbound calls the webhook starts an AI assistant with prompt, language and voice defined in environment variables (`AI_PROMPT`, `AI_LANGUAGE`, `AI_VOICE`).  Hooks exist to start recording or stream audio to your own AI service on call answer.

* **Campaign Management** – The `/api/campaign/start` route creates a new campaign, stores a list of target phone numbers, and dials up to the configured concurrency immediately.  Campaigns can be stopped via `/api/campaign/:id/stop`.

* **Supervisor Actions (Stubs)** – The `/api/supervisor/:callId/*` endpoints illustrate how supervisors could monitor, whisper to or barge into calls via Telnyx conferencing APIs.  These routes currently require the supervisor’s `call_control_id` to join an existing conference.  Extending them to dial a supervisor’s device and join conferences is left as an exercise.

* **Real‑Time Updates** – A Socket.IO server runs alongside the Express app.  Whenever a call’s status changes or a campaign starts, the backend broadcasts an event (`callUpdate`) to all connected clients.  The front‑end dashboard can subscribe to these events to display live data without polling.

## Getting Started

1. **Install dependencies** (optional):
   ```bash
   npm install
   ```

2. **Configure Environment** – Copy `.env.example` to `.env` and fill in your Postgres connection string, JWT secret, Telnyx API credentials, and AI assistant settings.

3. **Run Prisma Migrations** (optional):
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

5. **Expose Webhook Endpoint** – Use a tool like [ngrok](https://ngrok.com/) to expose your local webhook (e.g., `https://<ngrok-id>.ngrok.io/api/telnyx/webhook`) and configure it in the Telnyx Mission Control Portal under your Call Control application.

## Notes

* **Signature Verification** – For brevity the webhook handler does not verify Telnyx signatures.  You should validate the `Telnyx-Signature-Ed25519` and `Telnyx-Timestamp` headers with your `TELNYX_WEBHOOK_SECRET` to ensure authenticity.

* **Conference Management** – Telnyx conferences and supervisor roles (monitor, whisper, barge) are powerful but require additional logic to manage call legs and track conferences.  The supervisor routes provided here demonstrate the API calls but do not dial supervisors or create conferences automatically.

* **Campaign Worker** – A production campaign dialer should use a queue/worker system to throttle calls to the configured `concurrency` and handle retries or dispositions.  The `campaign` routes in this repository kick off the first batch of calls only.

* **Extensibility** – Feel free to extend this backend with features such as transcription saving, sentiment analysis integration, predictive analytics, multi‑channel support (SMS, chat, email), or deeper AI integrations.