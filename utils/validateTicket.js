
function validateTicket(data) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a JSON object."];
  }

  const {
    name,
    email,
    title,
    category,
    priority,
    description,
  } = data;

  // Validate name
  if (name === undefined || name === null) {
    errors.push("Name is required.");
  } else if (typeof name !== "string") {
    errors.push("Name must be a valid text string.");
  } else if (!name.trim()) {
    errors.push("Name is required.");
  } else if (name.trim().length < 2) {
    errors.push("Name must contain at least 2 characters.");
  } else if (name.trim().length > 60) {
    errors.push("Name cannot exceed 60 characters.");
  }

  // Validate email
  if (email === undefined || email === null) {
    errors.push("Email is required.");
  } else if (typeof email !== "string") {
    errors.push("Email must be a valid text string.");
  } else if (!email.trim()) {
    errors.push("Email is required.");
  } else if (email.trim().length > 100) {
    errors.push("Email cannot exceed 100 characters.");
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Please enter a valid email address.");
  }

  // Validate ticket title
  if (title === undefined || title === null) {
    errors.push("Ticket title is required.");
  } else if (typeof title !== "string") {
    errors.push("Ticket title must be a valid text string.");
  } else if (!title.trim()) {
    errors.push("Ticket title is required.");
  } else if (title.trim().length < 5) {
    errors.push("Ticket title must contain at least 5 characters.");
  } else if (title.trim().length > 100) {
    errors.push("Ticket title cannot exceed 100 characters.");
  }

  // Validate category
  const allowedCategories = [
    "Technical",
    "Account",
    "Billing",
    "Other",
  ];

  if (!allowedCategories.includes(category)) {
    errors.push("Please select a valid ticket category.");
  }

  // Validate priority
  const allowedPriorities = ["Low", "Medium", "High"];

  if (!allowedPriorities.includes(priority)) {
    errors.push("Please select a valid ticket priority.");
  }

  // Validate description
  if (description === undefined || description === null) {
    errors.push("Description is required.");
  } else if (typeof description !== "string") {
    errors.push("Description must be a valid text string.");
  } else if (!description.trim()) {
    errors.push("Description is required.");
  } else if (description.trim().length < 10) {
    errors.push("Description must contain at least 10 characters.");
  } else if (description.trim().length > 1000) {
    errors.push("Description cannot exceed 1000 characters.");
  }

  return errors;
}

module.exports = validateTicket;
