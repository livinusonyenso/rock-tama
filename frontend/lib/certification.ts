import type { ClaimStatus } from "@/content/claims";

export type Certification = {
  enabled: boolean;
  certificate: {
    issuer: string;
    number: string;
    entity: string;
    scope: string;
    issuedOn: string;
    expiresOn: string;
  } | null;
};

/** A display flag alone never establishes certification. Dates use ISO calendar days. */
export function canShowCertification(config: Certification, claimStatus: ClaimStatus, asOf: string) {
  const certificate = config.certificate;
  if (!config.enabled || claimStatus !== "verified" || !certificate) return false;
  if (![certificate.issuer, certificate.number, certificate.entity, certificate.scope].every(value => value.trim().length > 0)) return false;
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  return validDate(asOf) && validDate(certificate.issuedOn) && validDate(certificate.expiresOn)
    && certificate.issuedOn <= asOf && asOf <= certificate.expiresOn;
}
