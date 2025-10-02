/*
 * Supervisor routes.
 *
 * These endpoints allow supervisors to monitor, whisper to, or barge into
 * ongoing calls. The implementation uses the Telnyx conferencing API to
 * join a supervisor call leg with the appropriate role. Due to the
 * complexity of establishing conferences and dialing supervisors, these
 * routes currently act as stubs and demonstrate how to call the Telnyx
 * API. Extend them to dial the supervisor and join the conference.
 */

const express = require('express');
const requireAuth = require('../middleware/auth');
const { joinConference, switchRole } = require('../services/telnyxService');

module.exports = function supervisorRouter(prisma) {
  const router = express.Router();

  // Middleware to require supervisor role
  function requireSupervisor(req, res, next) {
    if (req.user.role !== 'SUPERVISOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Supervisor privileges required' });
    }
    next();
  }

  // Generic helper to request join with a given role
  async function handleJoin(req, res, next, role) {
    try {
      const { callId } = req.params;
      const { supervisorCallControlId, whisperTo } = req.body;
      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call) return res.status(404).json({ error: 'Call not found' });
      if (!call.telnyxConferenceId) {
        return res.status(400).json({ error: 'Call is not in a conference; unable to join' });
      }

      if (!supervisorCallControlId) {
        // In a real implementation, you would dial the supervisor's phone or
        // WebRTC client to obtain a call_control_id and then call joinConference.
        return res.status(400).json({ error: 'Missing supervisorCallControlId' });
      }
      // Build options for join request
      const options = {};
      if (role === 'monitor' || role === 'whisper') {
        options.supervisor_role = role;
      }
      if (role === 'whisper' && whisperTo) {
        options.whisper_to = whisperTo;
      }
      // Join conference with supervisor role
      await joinConference(call.telnyxConferenceId, supervisorCallControlId, options);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }

  // Monitor: supervisor hears call but is muted
  router.post('/:callId/monitor', requireAuth, requireSupervisor, (req, res, next) => {
    handleJoin(req, res, next, 'monitor');
  });

  // Whisper: supervisor speaks only to the agent
  router.post('/:callId/whisper', requireAuth, requireSupervisor, (req, res, next) => {
    handleJoin(req, res, next, 'whisper');
  });

  // Barge: supervisor fully joins the call
  router.post('/:callId/barge', requireAuth, requireSupervisor, (req, res, next) => {
    handleJoin(req, res, next, 'barge');
  });

  return router;
};