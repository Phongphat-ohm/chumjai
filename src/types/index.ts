export type UserRole =
  | "ADMIN"
  | "RECEPTIONIST"
  | "NURSE"
  | "DOCTOR"
  | "PHARMACIST"
  | "PATIENT";

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  label?: string;
}
