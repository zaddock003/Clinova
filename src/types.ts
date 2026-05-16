export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'ASSIGNED' | 'COMPLETED';
export type Specialization = 'General' | 'Cardiology' | 'Neurology' | 'Emergency' | 'Pulmonology';

export type PatientContact = {
  name: string;
  relation: string;
  phone: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  age: number;
  gender?: string;
  medicalHistory: string[];
  allergies: string[];
  currentConditions: string[];
  emergencyContacts: PatientContact[];
  healthInsights: string[];
  location?: string;
};

export type PatientCase = {
  id: string;
  patientId: string;
  createdAt: string;
  symptoms: string;
  naturalDescription: string;
  severity: SeverityLevel;
  urgencyScore: number;
  status: CaseStatus;
  assignedHospitalId?: string;
  assignedDoctorId?: string;
  suggestedDiagnosis: string[];
  recommendedActions: string[];
  riskAnalysis: string;
  notes: string[];
  isEmergency: boolean;
};

export type Doctor = {
  id: string;
  name: string;
  title: string;
  specialty: Specialization;
  available: boolean;
};

export type Hospital = {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  availableBeds: number;
  icuBeds: number;
  emergencyQueue: number;
  departments: Record<Specialization, number>;
  readiness: 'READY' | 'BUSY' | 'ALERT';
};

export type EmergencyEvent = {
  id: string;
  caseId: string;
  triggeredAt: string;
  severity: SeverityLevel;
  hospitalId?: string;
  status: 'DISPATCHED' | 'ROUTING' | 'ARRIVED';
  patientLocation?: string;
  message: string;
  report: string;
};

export type ClinovaState = {
  patients: PatientProfile[];
  doctors: Doctor[];
  hospitals: Hospital[];
  cases: PatientCase[];
  events: EmergencyEvent[];
};
