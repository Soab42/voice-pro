/*
 * Campaign routes.
 *
 * Provides endpoints to start and stop outbound call campaigns. Campaigns
 * dial a list of numbers with a configurable concurrency limit. The
 * initial set of calls is made immediately up to the concurrency limit.
 * Future calls and retry logic should be handled by a background worker.
 */

const express = require('express');
const { dial } = require('../services/telnyxService');
const requireAuth = require('../middleware/auth');

module.exports = function campaignRouter(prisma) {
  const router = express.Router();

  // Start a new campaign
  router.post('/start', requireAuth, async (req, res, next) => {
    try {
      const { name, numbers, concurrency = 5 } = req.body;
      if (!Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'numbers must be a non-empty array' });
      }

      // Create campaign and targets
      const campaign = await prisma.campaign.create({
        data: { name: name || 'Untitled Campaign', concurrency },
      });
      await prisma.campaignTarget.createMany({
        data: numbers.map((phone) => ({ phone, campaignId: campaign.id })),
      });

      // Dial up to concurrency phone numbers
      const batch = numbers.slice(0, concurrency);
      for (const phone of batch) {
        try {
          await dial({ to: phone });
        } catch (err) {
          console.error(`Failed to dial ${phone}:`, err.message);
        }
      }
      // Respond with campaign ID
      res.json({ id: campaign.id });
    } catch (err) {
      next(err);
    }
  });

  // Stop a campaign
  router.post('/:campaignId/stop', requireAuth, async (req, res, next) => {
    try {
      const { campaignId } = req.params;
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'stopped' } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
};