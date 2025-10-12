/*
 * Call routes.
 *
 * Provides endpoints for initiating outbound calls, hanging up calls, and
 * listing active calls. Uses the Telnyx service to interact with the
 * telephony API and Prisma to persist call records. Real‑time updates are
 * broadcast via Socket.IO when call status changes.
 */

const express = require("express");
const {
  dial,
  hangup,
  bridge,
  startRecording,
  startAI,
  startStreaming,
} = require("../services/telnyxService");
const requireAuth = require("../middleware/auth");

module.exports = function callsRouter(prisma) {
  const router = express.Router();

  // Create an outbound call initiated by an agent
  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const {
        to,
        record = false,
        useAI = false,
        aiProvider = "telnyx",
      } = req.body;
      const { userId } = req.user;
      if (!to) {
        return res.status(400).json({ error: "Missing destination number" });
      }

      // Dial the outbound number using Telnyx
      const telnyxCall = await dial({ to });
      const legId = telnyxCall?.data?.call_control_id;
      // Save call record
      const call = await prisma.call.create({
        data: {
          agentId: userId,
          customerNumber: to,
          direction: "outbound",
          status: "INITIATED",
          telnyxLegA: legId,
        },
      });

      // Optionally start recording once the call is answered (handled in webhook)
      // Optionally start AI assistant once answered (handled in webhook)

      res.json({ id: call.id, telnyxLegId: legId });
    } catch (err) {
      next(err);
    }
  });

  // List active calls (optional helper)
  router.get("/active", requireAuth, async (req, res, next) => {
    try {
      const calls = await prisma.call.findMany({
        where: { status: { notIn: ["COMPLETED", "FAILED", "NO_ANSWER"] } },
      });
      res.json(calls);
    } catch (err) {
      next(err);
    }
  });

  // retrive all call history
  router.get("/history", requireAuth, async (req, res, next) => {
    console.log("history");
    try {
      const calls = await prisma.call.findMany({
        orderBy: {
          startedAt: "desc",
        },
      });
      res.json(calls);
    } catch (err) {
      next(err);
    }
  });

  // Get call history for a specific customer
  router.get(
    "/history/:customerNumber",
    requireAuth,
    async (req, res, next) => {
      console.log("history customer");
      try {
        const { customerNumber } = req.params;
        const decodedNumber = decodeURIComponent(customerNumber);

        const calls = await prisma.call.findMany({
          where: {
            customerNumber: decodedNumber,
          },
          orderBy: {
            startedAt: "desc",
          },
          take: 10, // Limit to the last 10 calls for performance
        });

        res.json(calls);
      } catch (err) {
        next(err);
      }
    }
  );

  // Get a single call by ID
  router.get("/:callId", requireAuth, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const call = await prisma.call.findUnique({
        where: { id: callId },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }

      // Optional: Check permissions
      // if (req.user.role === "AGENT" && call.agentId !== req.user.userId) {
      //   return res.status(403).json({ error: "Forbidden" });
      // }

      res.json(call);
    } catch (err) {
      next(err);
    }
  });

  // Hang up a call
  router.post("/:callId/hangup", requireAuth, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }
      // Only the agent who created the call or a supervisor can hang up
      if (
        call.agentId &&
        call.agentId !== req.user.userId &&
        req.user.role === "AGENT"
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (call.telnyxLegA) {
        await hangup(call.telnyxLegA);
      }
      if (call.telnyxLegB) {
        await hangup(call.telnyxLegB);
      }
      await prisma.call.update({
        where: { id: callId },
        data: { status: "COMPLETED", endedAt: new Date() },
      });
      // Broadcast call ended
      req.broadcast("callUpdate", { id: call.id, status: "COMPLETED" });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
  //bridge
  router.post("/:callId/bridge", requireAuth, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }
      if (call.telnyxLegA) {
        await bridge(call.telnyxLegA);
      }
      if (call.telnyxLegB) {
        await bridge(call.telnyxLegB);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // start streaming
  router.post("/:callId/stream", requireAuth, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }
      if (call.telnyxLegA) {
        await startStreaming(call.telnyxLegA);
      }
      if (call.telnyxLegB) {
        await startStreaming(call.telnyxLegB);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // start ai
  router.post("/:callId/ai", requireAuth, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }
      if (call.telnyxLegA) {
        await startAI(call.telnyxLegA);
      }
      if (call.telnyxLegB) {
        await startAI(call.telnyxLegB);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
