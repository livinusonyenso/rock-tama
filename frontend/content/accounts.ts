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
  /** Label for the location field: where they want delivery, operate, or trade. */
  locationLabel: string;
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
      locationLabel: "Delivery city and state",
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
      locationLabel: "City and state you operate in",
      submit: "Apply as a driver",
      consent: "I agree that ROCK-TAMA may use these details to review my driver application and contact me about deliveries.",
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
      locationLabel: "City and state",
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
