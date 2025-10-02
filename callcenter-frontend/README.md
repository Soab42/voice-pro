# Call Center Frontend

This Next.js project provides a user interface for the Telnyx‑powered call center backend.  It includes pages for authentication, a real‑time dashboard, call control, and campaign management.  The frontend communicates with the backend via RESTful API calls and listens for real‑time updates through Socket.IO.

## Getting Started

1. **Install dependencies** (optional but recommended):
   ```bash
   npm install
   ```

2. **Configuration** – Copy `.env.example` to `.env` and set the following environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` – Base URL of your backend API (e.g. `http://localhost:4000`).
   - `NEXT_PUBLIC_SOCKET_URL` – URL of the Socket.IO server (often the same as the backend).

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features

* **Authentication** – Login and optional registration pages allow agents, supervisors, and admins to sign in. Tokens are stored in local storage and decoded to determine user roles.

* **Dashboard** – The main dashboard shows the number of active calls, allows agents to place outbound calls, and displays a live list of calls with actions for hanging up.  Supervisors and admins can start outbound campaigns and monitor, whisper, or barge into existing calls (stubs).

* **Real‑Time Updates** – The dashboard listens for `callUpdate` events over Socket.IO.  When a call’s status changes (e.g. ringing, active, completed), the list updates instantly without a page refresh.

* **Campaign Management** – Supervisors and admins can create new campaigns by specifying a name, a list of phone numbers, and a concurrency limit.  Upon submission, the frontend sends a POST request to the backend and displays the campaign ID.

## Notes

* **Tailwind CSS** – The project uses Tailwind CSS for styling.  Make sure to install the dependencies (`tailwindcss`, `postcss`, `autoprefixer`) and run the development server to see styles applied.

* **Supervisor Actions** – The monitor/whisper/barge buttons currently post to the backend with a stubbed `supervisorCallControlId`.  Extend these handlers to capture the supervisor’s own call control ID or integrate with WebRTC as needed.

* **Security** – Always serve the frontend and backend over HTTPS in production, and set appropriate CORS and authentication headers on API requests.