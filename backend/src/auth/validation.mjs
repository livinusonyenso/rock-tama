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

export const accountTypes = ["customer", "driver", "distributor"];
export const vehicleTypes = ["motorcycle", "tricycle", "van", "truck"];
export const idTypes = ["drivers_licence", "nin"];
export const availabilities = ["full_time", "part_time", "weekends"];
export const businessTypes = ["retailer", "supermarket", "hotel_restaurant", "wholesaler", "sub_distributor", "other"];
export const monthlyVolumes = ["under_50", "50_200", "200_500", "over_500"];

// Fields each account type sends (D-137, D-138). Every key must be present, and no other key is accepted.
const shared = ["accountType", "email", "password", "name", "phone", "street", "city", "state", "consent"];
const registrationFields = {
  customer: shared,
  driver: [...shared, "dateOfBirth", "idType", "idNumber", "licenceExpiry", "vehicleType", "plateNumber", "operatingArea", "availability"],
  distributor: [...shared, "position", "company", "businessType", "cacNumber", "supplyAreas", "monthlyVolume", "hasStorage", "hasVehicle"],
};
// The distributor form from before account types (D-134); still accepted so older clients keep working.
const legacyDistributorFields = ["email", "password", "name", "company", "phone", "location", "consent"];

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date in YYYY-MM-DD form, as a UTC Date, or null. */
function parseDate(value) {
  const match = typeof value === "string" && datePattern.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function yearsBetween(from, to) {
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  if (to.getUTCMonth() < from.getUTCMonth() || (to.getUTCMonth() === from.getUTCMonth() && to.getUTCDate() < from.getUTCDate())) years -= 1;
  return years;
}

/** Upper-case letters and digits only (spaces and hyphens removed), within a length range. */
function normalizeCode(value, pattern) {
  if (typeof value !== "string" || value.length > 40) return null;
  const code = value.toUpperCase().replace(/[\s-]/g, "");
  return pattern.test(code) ? code : null;
}

function legacyDistributor(body) {
  const email = normalizeEmail(body.email);
  const name = normalizeLabel(body.name, 100);
  const company = normalizeLabel(body.company, 150);
  const phone = normalizePhone(body.phone);
  const location = normalizeLabel(body.location, 80);
  if (!email || !name || !company || !phone || !location || [...location].length < 2) return null;
  if (body.consent !== true || !validPassword(body.password, 15)) return null;
  return { email, password: body.password, name, company, phone, location, role: "distributor", vehicleType: null, profile: {}, identity: null };
}

/**
 * Validate a registration for its account type and split it into account columns, the non-sensitive profile and
 * (drivers only) the identity record, which the API can write but never read back. `today` is injectable for tests.
 */
export function validateRegistration(body, today = new Date()) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  if (!Object.hasOwn(body, "accountType")) return exactFields(body, legacyDistributorFields) ? legacyDistributor(body) : null;
  const role = body.accountType;
  if (!accountTypes.includes(role) || !exactFields(body, registrationFields[role])) return null;

  const email = normalizeEmail(body.email);
  const name = normalizeLabel(body.name, 100);
  const phone = normalizePhone(body.phone);
  const street = normalizeLabel(body.street, 150);
  const city = normalizeLabel(body.city, 60);
  const state = normalizeLabel(body.state, 40);
  // Consent must be an explicit true; the form's required checkbox sends it.
  if (!email || !name || !phone || !street || !city || !state || [...city].length < 2 || [...state].length < 2) return null;
  if (body.consent !== true || !validPassword(body.password, 15)) return null;
  const address = { street, city, state };
  const account = { email, password: body.password, name, phone, location: `${city}, ${state}`, role, company: null, vehicleType: null, identity: null };

  if (role === "customer") return { ...account, profile: { address } };

  if (role === "driver") {
    const birth = parseDate(body.dateOfBirth);
    if (!birth) return null;
    const age = yearsBetween(birth, today);
    if (age < 18 || age > 80) return null;
    if (!idTypes.includes(body.idType)) return null;
    const idNumber = body.idType === "nin" ? normalizeCode(body.idNumber, /^[0-9]{11}$/) : normalizeCode(body.idNumber, /^[A-Z0-9]{8,15}$/);
    if (!idNumber) return null;
    let licenceExpiry = null;
    if (body.idType === "drivers_licence") {
      const expiry = parseDate(body.licenceExpiry);
      if (!expiry || expiry < new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))) return null;
      licenceExpiry = body.licenceExpiry;
    } else if (body.licenceExpiry !== "") return null;
    const plateNumber = normalizeCode(body.plateNumber, /^[A-Z0-9]{5,10}$/);
    const operatingArea = normalizeLabel(body.operatingArea, 150);
    if (!vehicleTypes.includes(body.vehicleType) || !plateNumber || !operatingArea || !availabilities.includes(body.availability)) return null;
    return {
      ...account, vehicleType: body.vehicleType,
      profile: { address, dateOfBirth: body.dateOfBirth, idType: body.idType, idLast4: idNumber.slice(-4), licenceExpiry, plateNumber, operatingArea, availability: body.availability },
      identity: { idType: body.idType, idNumber, licenceExpiry },
    };
  }

  const company = normalizeLabel(body.company, 150);
  const position = normalizeLabel(body.position, 100);
  const supplyAreas = normalizeLabel(body.supplyAreas, 200);
  // Optional: RC (companies), BN (business names) or IT (trustees) followed by digits; empty when not registered.
  const cacNumber = body.cacNumber === "" ? null : normalizeCode(body.cacNumber, /^(RC|BN|IT)[0-9]{4,8}$/);
  if (!company || !position || !supplyAreas || (body.cacNumber !== "" && !cacNumber)) return null;
  if (!businessTypes.includes(body.businessType) || !monthlyVolumes.includes(body.monthlyVolume)) return null;
  if (typeof body.hasStorage !== "boolean" || typeof body.hasVehicle !== "boolean") return null;
  return {
    ...account, company,
    profile: { address, position, businessType: body.businessType, cacNumber, supplyAreas, monthlyVolume: body.monthlyVolume, hasStorage: body.hasStorage, hasVehicle: body.hasVehicle },
  };
}

export function validateLogin(body) {
  if (!exactFields(body, ["email", "password"])) return null;
  const email = normalizeEmail(body.email);
  if (!email || !validPassword(body.password, 1)) return null;
  return { email, password: body.password };
}
