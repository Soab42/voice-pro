const express = require("express");
const requireAuth = require("../middleware/auth");

// Simple E.164-ish validator: starts with + and 8-15 digits total
function isValidPhone(value) {
  return typeof value === "string" && /^\+?[1-9]\d{7,14}$/.test(value.trim());
}

module.exports = function numbersRouter(prisma) {
  const router = express.Router();

  // Create (add) a phone number
  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const {
        phone,
        label = null,
        provider = null,
        active = true,
        name = null,
        email = null,
        address = null,
        designation = null,
      } = req.body || {};
      if (!phone || !isValidPhone(phone)) {
        return res
          .status(400)
          .json({
            error: "Invalid or missing 'phone' (use E.164 like +15551234567)",
          });
      }

      const created = await prisma.phoneNumber.create({
        data: {
          phone: phone.trim(),
          label,
          provider,
          active: Boolean(active),
          name,
          email,
          address,
          designation,
        },
      });

      // Notify clients
      req.broadcast?.("numbers:update", { type: "created", id: created.id });
      return res.status(201).json(created);
    } catch (err) {
      // Unique constraint
      if (err?.code === "P2002") {
        return res.status(409).json({ error: "Phone number already exists" });
      }
      next(err);
    }
  });

  // List all phone numbers
  router.get("/", requireAuth, async (req, res, next) => {
    try {
      const items = await prisma.phoneNumber.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  // Get a single phone number by id
  router.get("/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await prisma.phoneNumber.findUnique({
        where: { id: req.params.id },
      });
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // Update phone number metadata
  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const { label, active, provider, name, email, address, designation } =
        req.body || {};
      const data = {};
      if (typeof label !== "undefined") data.label = label;
      if (typeof provider !== "undefined") data.provider = provider;
      if (typeof active !== "undefined") data.active = Boolean(active);
      if (typeof name !== "undefined") data.name = name;
      if (typeof email !== "undefined") data.email = email;
      if (typeof address !== "undefined") data.address = address;
      if (typeof designation !== "undefined") data.designation = designation;

      const updated = await prisma.phoneNumber.update({
        where: { id: req.params.id },
        data,
      });
      req.broadcast?.("numbers:update", { type: "updated", id: updated.id });
      res.json(updated);
    } catch (err) {
      if (err?.code === "P2025") {
        return res.status(404).json({ error: "Not found" });
      }
      next(err);
    }
  });

  // Delete a phone number
  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      await prisma.phoneNumber.delete({ where: { id: req.params.id } });
      req.broadcast?.("numbers:update", { type: "deleted", id: req.params.id });
      res.json({ ok: true });
    } catch (err) {
      if (err?.code === "P2025") {
        return res.status(404).json({ error: "Not found" });
      }
      next(err);
    }
  });

  return router;
};
