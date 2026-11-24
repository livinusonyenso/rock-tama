import type { IconName } from "@/types/content";

/**
 * Account types and their registration copy (D-137). Customers, drivers and distributors register
 * themselves; admins are created only by the operator script (backend/src/create-admin.mjs).
 * The values match the Express API (`accountType`, `vehicleType`).
 */
export type AccountType = "customer" | "driver" | "distributor";
export type AccountRole = AccountType | "admin";
export type VehicleType = "motorcycle" | "tricycle" | "van" | "truck";

export const accountTypes: readonly AccountType[] = ["customer", "driver", "distributor"];

export const vehicleTypes: readonly { value: VehicleType; label: string }[] = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "tricycle", label: "Tricycle (keke)" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
];

export type IdType = "drivers_licence" | "nin";
export type Availability = "full_time" | "part_time" | "weekends";
export type BusinessType = "retailer" | "supermarket" | "hotel_restaurant" | "wholesaler" | "sub_distributor" | "other";
export type MonthlyVolume = "under_50" | "50_200" | "200_500" | "over_500";

type Option<T extends string> = { value: T; label: string };

/** Options shared by the registration forms and dashboards (D-138). Values match the Express API. */
export const idTypes: readonly Option<IdType>[] = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "drivers_licence", label: "Driver’s licence" },
];
export const availabilities: readonly Option<Availability>[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "weekends", label: "Weekends only" },
];
export const businessTypes: readonly Option<BusinessType>[] = [
  { value: "retailer", label: "Shop or retailer" },
  { value: "supermarket", label: "Supermarket" },
  { value: "hotel_restaurant", label: "Hotel, restaurant or caterer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "sub_distributor", label: "Sub-distributor" },
  { value: "other", label: "Other" },
];
export const monthlyVolumes: readonly Option<MonthlyVolume>[] = [
  { value: "under_50", label: "Under 50 cartons a month" },
  { value: "50_200", label: "50–200 cartons a month" },
  { value: "200_500", label: "200–500 cartons a month" },
  { value: "over_500", label: "Over 500 cartons a month" },
];
/** Nigeria's 36 states and the FCT. */
export const nigerianStates: readonly string[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

/** The left-hand panel of the account pages. */
export type AccountPanel = {
  eyebrow: string;
  heading: string;
  text: string;
  icon: IconName;
  points: readonly { icon: IconName; text: string }[];
  note: string;
};

type AccountTypeCopy = {
  label: string;
  summary: string;
  icon: IconName;
  panel: AccountPanel;
  /** Heading of the address section: delivery, home or business address. */
  addressLegend: string;
  submit: string;
  consent: string;
  intro: string;
  /** Shown after registration. The API answers identically for new and existing emails, so never "created". */
  received: { heading: string; text: string };
};

export const accountCopy = {
  login: {
    title: "Welcome back",
    description: "Log in to your ROCK-TAMA account.",
    intro: "Log in with the email and password you registered with. Driver and distributor accounts stay pending until our team approves them.",
    panel: {
      eyebrow: "ROCK-TAMA ACCOUNTS",
      heading: "One account for every way you work with us.",
      text: "Customers, drivers and distributors sign in here and go straight to their own dashboard.",
      icon: "user",
      points: [
        { icon: "shopping-cart", text: "Customers: order and follow deliveries" },
        { icon: "truck", text: "Drivers: see the deliveries assigned to you" },
        { icon: "warehouse", text: "Distributors: manage your partnership" },
      ],
      note: "New here? Create an account and choose the type that fits you.",
    },
  },
  register: {
    title: "Create your account",
    description: "Choose the account that fits you, then fill in your details.",
    pickerLabel: "I am registering as",
  },
  types: {
    customer: {
      label: "Customer",
      summary: "Order water for your home or business.",
      icon: "shopping-cart",
      panel: {
        eyebrow: "ROCK-TAMA CUSTOMERS",
        heading: "Natural spring water, delivered to you.",
        text: "A personal account for ordering ROCK-TAMA natural spring water.",
        icon: "shopping-cart",
        points: [
          { icon: "user", text: "Keep your contact details in one place" },
          { icon: "shopping-cart", text: "Shop our full range" },
          { icon: "truck", text: "Order history and delivery tracking are coming soon" },
        ],
        note: "Customer accounts can be used as soon as you register.",
      },
      addressLegend: "Delivery address",
      submit: "Create customer account",
      consent: "I agree that ROCK-TAMA may use these details to manage my account and contact me about my orders.",
      intro: "Your customer account is ready to use as soon as you register.",
      received: {
        heading: "Registration received",
        text: "Thank you. If this email can be registered, your customer account is ready. Log in with your email and password to continue.",
      },
    },
    driver: {
      label: "Driver / Logistics",
      summary: "Deliver ROCK-TAMA orders with your vehicle.",
      icon: "truck",
      panel: {
        eyebrow: "ROCK-TAMA LOGISTICS",
        heading: "Deliver with us.",
        text: "Register as a driver or logistics partner and receive delivery assignments once approved.",
        icon: "truck",
        points: [
          { icon: "truck", text: "Tell us about your vehicle" },
          { icon: "clipboard-check", text: "Our logistics team reviews your application" },
          { icon: "map-pin", text: "Receive deliveries in your area once approved" },
        ],
        note: "Registering is an application. Our team confirms each driver before any deliveries are assigned.",
      },
      addressLegend: "Home address",
      submit: "Apply as a driver",
      consent: "I agree that ROCK-TAMA may use these details, including my ID number, to verify my identity, review my driver application and contact me about deliveries. My ID number is stored securely and used only for verification.",
      intro: "Driver applications are reviewed by our logistics team before deliveries are assigned.",
      received: {
        heading: "Application received",
        text: "Thank you. If this email can be registered, your driver application is now with our logistics team for review. Log in with your email and password to follow its status; deliveries are assigned only after approval.",
      },
    },
    distributor: {
      label: "Distributor",
      summary: "Supply ROCK-TAMA water through your business.",
      icon: "warehouse",
      panel: {
        eyebrow: "ROCK-TAMA DISTRIBUTORS",
        heading: "Let’s build a lasting partnership.",
        text: "A dedicated account for businesses interested in supplying ROCK-TAMA natural spring water.",
        icon: "warehouse",
        points: [
          { icon: "building", text: "Register your business details" },
          { icon: "user", text: "Access your distributor profile" },
          { icon: "handshake", text: "Connect with our supply team" },
        ],
        note: "Creating an account is separate from distributor approval. Our team confirms eligibility and commercial terms.",
      },
      addressLegend: "Business address",
      submit: "Create distributor account",
      consent: "I agree that ROCK-TAMA may use these details to manage my distributor account and contact me about my application.",
      intro: "New applications are reviewed by our team before distributor access is granted.",
      received: {
        heading: "Application received",
        text: "Thank you. If this email can be registered, your distributor application is now with our team for review. Log in with your email and password to follow its status; distributor features open only after approval.",
      },
    },
  } satisfies Record<AccountType, AccountTypeCopy>,
} as const;
