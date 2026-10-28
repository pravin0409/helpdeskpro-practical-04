
const ticketForm = document.getElementById("ticketForm");
const messageBox = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const refreshButton = document.getElementById("refreshButton");
const ticketList = document.getElementById("ticketList");
const ticketCount = document.getElementById("ticketCount");

function showMessage(message, type, errors = []) {
  messageBox.replaceChildren();
  messageBox.className = `message ${type}`;

  const text = document.createElement("p");
  text.textContent = message;
  messageBox.appendChild(text);

  if (errors.length > 0) {
    const list = document.createElement("ul");

    errors.forEach((error) => {
      const item = document.createElement("li");
      item.textContent = error;
      list.appendChild(item);
    });

    messageBox.appendChild(list);
  }

  messageBox.hidden = false;
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.replaceChildren();
}

function createTag(text, extraClass = "") {
  const tag = document.createElement("span");
  tag.className = `tag ${extraClass}`.trim();
  tag.textContent = text;
  return tag;
}

function renderTickets(tickets) {
  ticketList.replaceChildren();
  ticketCount.textContent =
    `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} found`;

  if (tickets.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No tickets yet. Submit your first support ticket above.";
    ticketList.appendChild(empty);
    return;
  }

  tickets.forEach((ticket) => {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const title = document.createElement("h3");
    title.textContent = ticket.title;

    const owner = document.createElement("div");
    owner.textContent = `${ticket.name} · ${ticket.email}`;

    const meta = document.createElement("div");
    meta.className = "ticket-meta";

    meta.appendChild(createTag(ticket.category));
    meta.appendChild(
      createTag(ticket.priority, ticket.priority.toLowerCase())
    );
    meta.appendChild(createTag(ticket.status));

    const description = document.createElement("p");
    description.textContent = ticket.description;

    const id = document.createElement("div");
    id.className = "ticket-id";
    id.textContent = `Ticket ID: ${ticket.id}`;

    const date = document.createElement("div");
    date.className = "ticket-id";
    date.textContent = `Created: ${new Date(ticket.createdAt).toLocaleString()}`;

    card.append(title, owner, meta, description, id, date);
    ticketList.appendChild(card);
  });
}

async function loadTickets() {
  ticketCount.textContent = "Loading tickets...";

  try {
    const response = await fetch("/api/tickets");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load tickets.");
    }

    renderTickets(result.tickets);
  } catch (error) {
    ticketCount.textContent = "Could not load tickets.";
    ticketList.replaceChildren();

    const message = document.createElement("div");
    message.className = "empty-state";
    message.textContent = error.message;
    ticketList.appendChild(message);
  }
}

ticketForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(ticketForm);
  const data = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showMessage(
        result.message || "Please correct the submitted information.",
        "error",
        result.errors || []
      );
      return;
    }

    showMessage(
      `${result.message} Your ticket ID is ${result.ticket.id}.`,
      "success"
    );

    ticketForm.reset();
    await loadTickets();
  } catch (error) {
    showMessage(
      "Unable to contact the server. Make sure HelpDeskPro is running.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit support ticket";
  }
});

refreshButton.addEventListener("click", loadTickets);

// Load tickets when the page opens
loadTickets();
