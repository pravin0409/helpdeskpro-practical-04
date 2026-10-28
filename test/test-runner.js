/**
 * HelpDeskPro - Automated Practical No. 04 Test Suite
 * Pure Node.js (no external dependencies required)
 */

const http = require("node:http");
const app = require("../server");

// Helper to make HTTP requests against the ephemeral test server
function sendRequest(port, { method = "GET", path = "/", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body !== null && typeof body === "object" ? JSON.stringify(body) : body;

    const requestHeaders = { ...headers };
    if (payload !== null && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    }
    if (payload !== null && !requestHeaders["Content-Length"]) {
      requestHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: requestHeaders,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = null;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawData,
            json,
          });
        });
      }
    );

    req.on("error", (err) => reject(err));

    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log(" HelpDeskPro - Practical No. 04 Automated Test Suite");
  console.log("===============================================================\n");

  // Spin up test server on port 0 (OS picks available ephemeral port)
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const testPort = server.address().port;
  console.log(`[INFO] Test server safely initialized on ephemeral port :${testPort}\n`);

  let passedCount = 0;
  let failedCount = 0;

  const validTicketPayload = {
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni@example.com",
    title: "Cannot access examination portal",
    category: "Technical",
    priority: "High",
    description: "Whenever I submit the login form, the examination dashboard returns a 504 error.",
  };

  const testCases = [
    {
      id: 1,
      name: "Valid ticket creation returns HTTP 201 and ticket details",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: validTicketPayload,
        });
        if (res.statusCode !== 201) return `Expected status 201, got ${res.statusCode}`;
        if (!res.json || res.json.success !== true) return "Expected success to be true";
        if (!res.json.ticket || !res.json.ticket.id) return "Expected created ticket with UUID";
        if (res.json.ticket.status !== "Open") return "Expected ticket status to be 'Open'";
        return true;
      },
    },
    {
      id: 2,
      name: "Invalid email returns HTTP 400 and validation error",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, email: "invalid-email-address" },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || res.json.success !== false) return "Expected success to be false";
        if (!res.json.errors || !res.json.errors.includes("Please enter a valid email address.")) {
          return "Expected 'Please enter a valid email address.' error message";
        }
        return true;
      },
    },
    {
      id: 3,
      name: "Missing name returns HTTP 400 and required error",
      execute: async () => {
        const payload = { ...validTicketPayload };
        delete payload.name;
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: payload,
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Name is required.")) {
          return "Expected 'Name is required.' error message";
        }
        return true;
      },
    },
    {
      id: 4,
      name: "Invalid priority returns HTTP 400",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, priority: "Critical" },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Please select a valid ticket priority.")) {
          return "Expected 'Please select a valid ticket priority.' error message";
        }
        return true;
      },
    },
    {
      id: 5,
      name: "Invalid category returns HTTP 400",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, category: "Infrastructure" },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Please select a valid ticket category.")) {
          return "Expected 'Please select a valid ticket category.' error message";
        }
        return true;
      },
    },
    {
      id: 6,
      name: "Whitespace-only title returns HTTP 400",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, title: "      " },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Ticket title is required.")) {
          return "Expected 'Ticket title is required.' error message";
        }
        return true;
      },
    },
    {
      id: 7,
      name: "Too-short description (<10 chars) returns HTTP 400",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, description: "Too short" },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Description must contain at least 10 characters.")) {
          return "Expected 'Description must contain at least 10 characters.' error message";
        }
        return true;
      },
    },
    {
      id: 8,
      name: "Non-string name (e.g. number) returns HTTP 400 with clear message",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          body: { ...validTicketPayload, name: 98765 },
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || !res.json.errors || !res.json.errors.includes("Name must be a valid text string.")) {
          return "Expected 'Name must be a valid text string.' error message";
        }
        return true;
      },
    },
    {
      id: 9,
      name: "Malformed JSON request body returns HTTP 400",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          headers: { "Content-Type": "application/json" },
          body: '{"name": "Broken JSON, missing closing brace',
        });
        if (res.statusCode !== 400) return `Expected status 400, got ${res.statusCode}`;
        if (!res.json || res.json.message !== "Invalid JSON request body.") {
          return "Expected 'Invalid JSON request body.' error message";
        }
        return true;
      },
    },
    {
      id: 10,
      name: "Oversized request body (>20KB) returns HTTP 413 Payload Too Large",
      execute: async () => {
        const oversizedString = "A".repeat(25000);
        const res = await sendRequest(testPort, {
          method: "POST",
          path: "/api/tickets",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Oversized", email: "test@example.com", title: "Large", category: "Other", priority: "Low", description: oversizedString }),
        });
        if (res.statusCode !== 413) return `Expected status 413, got ${res.statusCode}`;
        if (!res.json || res.json.message !== "Request payload too large (max 20KB).") {
          return "Expected 'Request payload too large (max 20KB).' error message";
        }
        return true;
      },
    },
    {
      id: 11,
      name: "GET /api/tickets retrieves current ticket list and count (HTTP 200)",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "GET",
          path: "/api/tickets",
        });
        if (res.statusCode !== 200) return `Expected status 200, got ${res.statusCode}`;
        if (!res.json || res.json.success !== true) return "Expected success to be true";
        if (typeof res.json.count !== "number" || !Array.isArray(res.json.tickets)) {
          return "Expected count number and tickets array";
        }
        return true;
      },
    },
    {
      id: 12,
      name: "Unknown endpoint returns HTTP 404 Route Not Found",
      execute: async () => {
        const res = await sendRequest(testPort, {
          method: "GET",
          path: "/api/non-existent-endpoint-audit",
        });
        if (res.statusCode !== 404) return `Expected status 404, got ${res.statusCode}`;
        if (!res.json || res.json.message !== "Route not found.") {
          return "Expected 'Route not found.' message";
        }
        return true;
      },
    },
  ];

  try {
    for (const test of testCases) {
      try {
        const result = await test.execute();
        if (result === true) {
          passedCount++;
          console.log(`  ✓ [PASS] Test #${test.id}: ${test.name}`);
        } else {
          failedCount++;
          console.log(`  ✗ [FAIL] Test #${test.id}: ${test.name}`);
          console.log(`           Reason: ${result}`);
        }
      } catch (err) {
        failedCount++;
        console.log(`  ✗ [FAIL] Test #${test.id}: ${test.name}`);
        console.log(`           Error: ${err.message}`);
      }
    }
  } finally {
    // Ensure test server always closes cleanly
    await new Promise((resolve) => server.close(resolve));
    console.log("\n[INFO] Test server cleanly closed.");
  }

  console.log("\n===============================================================");
  console.log(` RESULTS: ${passedCount} Passed, ${failedCount} Failed (Total ${testCases.length})`);
  console.log("===============================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
