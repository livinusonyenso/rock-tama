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
  if (!exactFields(body, ["email", "password", "name", "company"])) return null;
  const email = normalizeEmail(body.email);
  const name = normalizeLabel(body.name, 100);
  const company = normalizeLabel(body.company, 150);
  if (!email || !name || !company || !validPassword(body.password, 15)) return null;
  return { email, password: body.password, name, company };
}

export function validateLogin(body) {
  if (!exactFields(body, ["email", "password"])) return null;
  const email = normalizeEmail(body.email);
  if (!email || !validPassword(body.password, 1)) return null;
  return { email, password: body.password };
}
