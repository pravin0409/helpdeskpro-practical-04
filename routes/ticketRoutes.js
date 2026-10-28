
const express = require("express");
const { randomUUID } = require("node:crypto");
const validateTicket = require("../utils/validateTicket");

const router = express.Router();

// Temporary storage for tickets
const tickets = [];

// GET: Retrieve all tickets
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets,
  });
});

// POST: Validate and create a ticket
router.post("/", (req, res) => {
  const data = req.body;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object.",
    });
  }

  const errors = validateTicket(data);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Ticket validation failed.",
      errors,
    });
  }

  const ticket = {
    id: randomUUID(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    title: data.title.trim(),
    category: data.category,
    priority: data.priority,
    description: data.description.trim(),
    status: "Open",
    createdAt: new Date().toISOString(),
  };

  tickets.push(ticket);

  return res.status(201).json({
    success: true,
    message: "Support ticket created successfully.",
    ticket,
  });
});

// Export the router
module.exports = router;
