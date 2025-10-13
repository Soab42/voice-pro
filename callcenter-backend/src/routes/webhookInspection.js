/*
 * Webhook inspection API routes.
 *
 * This file provides endpoints for retrieving and managing webhook requests
 * for inspection and debugging purposes.
 */

const express = require("express");

module.exports = function webhookInspectionRouter(prisma) {
  const router = express.Router();

  // Get all webhook requests with pagination
  router.get("/", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [webhookRequests, totalCount] = await Promise.all([
        prisma.webhookRequest.findMany({
          orderBy: { timestamp: "desc" },
          skip,
          take: limit,
        }),
        prisma.webhookRequest.count(),
      ]);

      res.json({
        webhookRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching webhook requests:", error);
      res.status(500).json({ error: "Failed to fetch webhook requests" });
    }
  });

  // Get a specific webhook request by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const webhookRequest = await prisma.webhookRequest.findUnique({
        where: { id },
      });

      if (!webhookRequest) {
        return res.status(404).json({ error: "Webhook request not found" });
      }

      res.json(webhookRequest);
    } catch (error) {
      console.error("Error fetching webhook request:", error);
      res.status(500).json({ error: "Failed to fetch webhook request" });
    }
  });

  // Delete a specific webhook request
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.webhookRequest.delete({
        where: { id },
      });

      res.json({ message: "Webhook request deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook request:", error);
      res.status(500).json({ error: "Failed to delete webhook request" });
    }
  });

  // Clear all webhook requests
  router.delete("/", async (req, res) => {
    try {
      await prisma.webhookRequest.deleteMany({});
      res.json({ message: "All webhook requests deleted successfully" });
    } catch (error) {
      console.error("Error clearing webhook requests:", error);
      res.status(500).json({ error: "Failed to clear webhook requests" });
    }
  });

  return router;
};
