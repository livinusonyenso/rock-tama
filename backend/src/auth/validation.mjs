const emailPattern = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const controlCharacters = /[\p{Cc}\p{Cs}]/u;

function exactFields(body, fields) {
  return body && typeof body === "object" && !Array.isArray(body) &&
    Object.keys(body).length === fields.length && fields.every((field) => Object.hasOwn(body, field));
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !emailPattern.test(email)) return null;
  const [local] = email.split("@");
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  return email;
}

// Same rule as checkout (frontend/lib/checkout-details.ts), with whitespace collapsed for storage.
const phonePattern = /^\+?[0-9 ()-]{7,20}$/;

function normalizePhone(value) {
  if (typeof value !== "string" || value.length > 40) return null;
  const phone = value.trim().replace(/\s+/g, " ");
  return phonePattern.test(phone) ? phone : null;
}

function validPassword(value, minimum) {
  if (typeof value !== "string" || value.length > 256 || /\p{Cs}/u.test(value)) return false;
  const length = [...value].length;
  return length >= minimum && length <= 128;
}

function normalizeLabel(value, maximum) {
  if (typeof value !== "string" || value.length > maximum * 2) return null;
  const label = value.trim();
  if (!label || controlCharacters.test(label) || [...label].length > maximum) return null;
  return label;
}

export function validateRegistration(body) {
  if (!exactFields(body, ["email", "password", "name", "company", "phone", "location", "consent"])) return null;
  const email = normalizeEmail(body.email);
  const name = normalizeLabel(body.name, 100);
  const company = normalizeLabel(body.company, 150);
  const phone = normalizePhone(body.phone);
  const location = normalizeLabel(body.location, 80);
  // Consent must be an explicit true; the form's required checkbox sends it.
  if (!email || !name || !company || !phone || !location || [...location].length < 2) return null;
  if (body.consent !== true || !validPassword(body.password, 15)) return null;
  return { email, password: body.password, name, company, phone, location };
}

export function validateLogin(body) {
  if (!exactFields(body, ["email", "password"])) return null;
  const email = normalizeEmail(body.email);
  if (!email || !validPassword(body.password, 1)) return null;
  return { email, password: body.password };
}
