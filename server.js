
const express = require("express");
const path = require("node:path");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and form data
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to HelpDeskPro API",
    endpoints: {
      getTickets: "GET /api/tickets",
      createTicket: "POST /api/tickets",
    },
  });
});

// Ticket routes
app.use("/api/tickets", ticketRoutes);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Handle malformed JSON, oversized payloads, and other request errors
app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large (max 20KB).",
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HelpDeskPro running at http://localhost:${PORT}`);
    console.log(`Ticket API: http://localhost:${PORT}/api/tickets`);
  });
}

module.exports = app;
