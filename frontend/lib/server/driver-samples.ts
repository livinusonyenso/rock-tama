import "server-only";
import type { Account } from "@/lib/server/api";

export type DriverSampleDelivery = {
  reference: string;
  area: string;
  destination: string;
  load: string;
  timing: string;
  status: "scheduled" | "inTransit" | "delivered";
};

const samples: readonly DriverSampleDelivery[] = [
  { reference: "DEMO-1041", area: "Independence Layout, Enugu", destination: "Sample café", load: "6 cartons of 750 ml glass bottles", timing: "Monday, 9:00–11:00 AM WAT", status: "inTransit" },
  { reference: "DEMO-1042", area: "GRA, Enugu", destination: "Sample hotel", load: "12 cartons of 1.5 L bottles", timing: "Monday, 1:00–3:00 PM WAT", status: "scheduled" },
  { reference: "DEMO-1043", area: "New Haven, Enugu", destination: "Sample retailer", load: "8 cartons of 750 ml glass bottles", timing: "Tuesday, 10:00 AM–12:00 PM WAT", status: "scheduled" },
  { reference: "DEMO-1040", area: "Trans Ekulu, Enugu", destination: "Sample office", load: "4 cartons of 1.5 L bottles", timing: "Friday, delivered at 10:35 AM WAT", status: "delivered" },
];

export function driverSampleDeliveries(account: Pick<Account, "email" | "role" | "status">) {
  if (
    process.env.NODE_ENV === "development" &&
    account.role === "driver" &&
    account.status === "approved" &&
    account.email === "driver.demo@example.test"
  ) {
    return samples;
  }
  return null;
}
