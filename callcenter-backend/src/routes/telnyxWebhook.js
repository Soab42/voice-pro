/*
 * Telnyx webhook handler.
 *
 * This endpoint receives events from Telnyx and updates call records
 * accordingly. It can optionally answer inbound calls, start AI assistants,
 * and initiate recordings. Events are broadcast to connected clients via
 * Socket.IO for real‑time dashboard updates. Signature verification
 * should be implemented in production using the TELNYX_WEBHOOK_SECRET
 * environment variable.
 */

const express = require("express");
const {
  answer,
  startAI,
  startRecording,
  startStreaming,
  bridge,
} = require("../services/telnyxService");

module.exports = function telnyxWebhookRouter(prisma) {
  const router = express.Router();

  router.post("/", async (req, res, next) => {
    try {
      const { data } = req.body || {};
      const event = data?.event_type;
      const payload = data?.payload;
      if (!event || !payload) {
        return res.json({ received: true });
      }
      const callControlId = payload.call_control_id;
      const direction = payload.direction;
      // Attempt to find existing call record by leg IDs
      let call = await prisma.call.findFirst({
        where: {
          OR: [{ telnyxLegA: callControlId }, { telnyxLegB: callControlId }],
        },
      });

      // Handler based on event type
      switch (event) {
        case "call.initiated": {
          if (direction === "incoming") {
            // Create a new call record for inbound calls
            if (!call) {
              call = await prisma.call.create({
                data: {
                  customerNumber: payload.from ?? payload.caller_id_name,
                  direction: "inbound",
                  status: "RINGING",
                  telnyxLegA: callControlId,
                },
              });
            } else {
              await prisma.call.update({
                where: { id: call.id },
                data: { status: "RINGING" },
              });
            }
            // Auto‑answer inbound call
            // await answer(callControlId);
            // Optionally start the built‑in AI assistant on inbound calls
            // const aiConfig = {
            //   prompt: process.env.AI_PROMPT || "You are a helpful agent.",
            //   language: process.env.AI_LANGUAGE || "en-US",
            //   voice: process.env.AI_VOICE || "alloy",
            // };
            // try {
            //   await startAI(callControlId, aiConfig);
            // } catch (err) {
            //   console.error("Failed to start AI:", err.message);
            // }
            req.broadcast("callUpdate", { id: call.id, status: "RINGING", customerNumber: payload.from ?? payload.caller_id_name });
          } else {
            // Outbound call is ringing
            if (call) {
              await prisma.call.update({
                where: { id: call.id },
                data: { status: "RINGING" },
              });
              req.broadcast("callUpdate", { id: call.id, status: "RINGING" });
            }
          }
          break;
        }
        case "call.answered": {
          if (call) {
            await prisma.call.update({
              where: { id: call.id },
              data: { status: "ACTIVE", answeredAt: new Date() },
            });
            // Optionally start recording or AI on answer for outbound calls
            req.broadcast("callUpdate", { id: call.id, status: "ACTIVE" });
          }
          break;
        }
        case "call.bridged": {
          // When calls are bridged we update status to ACTIVE and store the second leg
          if (call) {
            const otherLeg =
              payload?.call_control_id || payload?.call_session_id;
            if (!call.telnyxLegB) {
              await prisma.call.update({
                where: { id: call.id },
                data: { telnyxLegB: otherLeg, status: "ACTIVE" },
              });
            } else {
              await prisma.call.update({
                where: { id: call.id },
                data: { status: "ACTIVE" },
              });
            }
            req.broadcast("callUpdate", { id: call.id, status: "ACTIVE" });
          }
          break;
        }
        case "call.hangup": {
          if (call) {
            await prisma.call.update({
              where: { id: call.id },
              data: { status: "COMPLETED", endedAt: new Date() },
            });
            req.broadcast("callUpdate", { id: call.id, status: "COMPLETED" });
          }
          break;
        }
        case "call.no_answer": {
          if (call) {
            await prisma.call.update({
              where: { id: call.id },
              data: { status: "NO_ANSWER" },
            });
            req.broadcast("callUpdate", { id: call.id, status: "NO_ANSWER" });
          }
          break;
        }
        case "call.recording.saved": {
          // Save recording URL when provided
          if (call) {
            const recordingUrl = payload?.recording_url;
            if (recordingUrl) {
              await prisma.call.update({
                where: { id: call.id },
                data: { recordingUrl },
              });
            }
          }
          break;
        }

        case "call.cost": {
          if (call) {
            const cost = payload?.total_cost;
            if (cost) {
              await prisma.call.update({
                where: { id: call.id },
                data: { cost: parseFloat(cost) },
              });
            }
          }
          break;
        }

        case "ai.transcription": {
          if (call) {
            req.broadcast("ai.update", {
              callId: call.id,
              type: "transcription",
              data: payload,
            });
          }
          break;
        }

        case "ai.suggestion": {
          if (call) {
            req.broadcast("ai.update", {
              callId: call.id,
              type: "suggestion",
              data: payload,
            });
          }
          break;
        }
        default:
          // Unhandled events are ignored
          break;
      }
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
