import type {
  User,
  Permission,
  UserPermission,
  Patient,
  PatientAllergy,
  PatientCondition,
  PatientMedication,
  Visit,
  VitalSign,
  TriageRecord,
  QueueType,
  Queue,
  Consultation,
  SoapNote,
  Diagnosis,
  Drug,
  DrugBatch,
  InventoryTransaction,
  Prescription,
  PrescriptionItem,
  Dispensation,
  Appointment,
  Vaccine,
  Vaccination,
  LabOrder,
  LabResult,
  Referral,
  AuditLog,
  ClinicSetting,
  SystemSetting,
} from "@prisma/client";

export type {
  User,
  Permission,
  UserPermission,
  Patient,
  PatientAllergy,
  PatientCondition,
  PatientMedication,
  Visit,
  VitalSign,
  TriageRecord,
  QueueType,
  Queue,
  Consultation,
  SoapNote,
  Diagnosis,
  Drug,
  DrugBatch,
  InventoryTransaction,
  Prescription,
  PrescriptionItem,
  Dispensation,
  Appointment,
  Vaccine,
  Vaccination,
  LabOrder,
  LabResult,
  Referral,
  AuditLog,
  ClinicSetting,
  SystemSetting,
};

// Composite helper types
export type PatientWithRelations = Patient & {
  allergies?: PatientAllergy[];
  conditions?: PatientCondition[];
  medications?: PatientMedication[];
  visits?: Visit[];
};

export type VisitWithDetails = Visit & {
  patient: Patient;
  vitalSigns?: VitalSign[];
  triageRecord?: TriageRecord | null;
  consultation?: Consultation | null;
  prescription?: Prescription | null;
};
