export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'ASSIGNED' | 'COMPLETED';
export type Specialization = 'General' | 'Cardiology' | 'Neurology' | 'Emergency' | 'Pulmonology';
export type PatientCondition = {
  title: string;
  details: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  age: number;
  gender?: string;
  medicalHistory: string[];
  allergies: string[];
  currentConditions: string[];
  emergencyContacts: { name: string; relation: string; phone: string }[];
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

export const patients: PatientProfile[] = [
  {
    id: 'patient-001',
    name: 'Amara Patel',
    age: 34,
    gender: 'Female',
    medicalHistory: ['Hypertension', 'Seasonal asthma'],
    allergies: ['Penicillin', 'Shellfish'],
    currentConditions: ['Mild asthma', 'Recent fatigue'],
    emergencyContacts: [
      { name: 'Ravi Patel', relation: 'Spouse', phone: '+1-555-0199' },
      { name: 'Dr. Saira Khan', relation: 'Primary Care', phone: '+1-555-0220' }
    ],
    healthInsights: ['Blood pressure trends are stable.', 'Stress management can reduce flare-ups.'],
    location: 'Downtown Medical District'
  }
];

export const doctors: Doctor[] = [
  { id: 'doctor-001', name: 'Dr. Nia Roberts', title: 'ER Specialist', specialty: 'Emergency', available: true },
  { id: 'doctor-002', name: 'Dr. Luis Chen', title: 'Cardiologist', specialty: 'Cardiology', available: true },
  { id: 'doctor-003', name: 'Dr. Priya Singh', title: 'Pulmonologist', specialty: 'Pulmonology', available: true }
];

export const hospitals: Hospital[] = [
  {
    id: 'hospital-001',
    name: 'Clinova Central Hospital',
    location: 'Midtown',
    distanceKm: 3.2,
    availableBeds: 12,
    icuBeds: 4,
    emergencyQueue: 1,
    departments: { General: 8, Cardiology: 3, Neurology: 2, Emergency: 4, Pulmonology: 2 },
    readiness: 'READY'
  },
  {
    id: 'hospital-002',
    name: 'Northside Health Campus',
    location: 'North District',
    distanceKm: 6.8,
    availableBeds: 5,
    icuBeds: 2,
    emergencyQueue: 3,
    departments: { General: 4, Cardiology: 2, Neurology: 1, Emergency: 3, Pulmonology: 1 },
    readiness: 'BUSY'
  },
  {
    id: 'hospital-003',
    name: 'Riverfront Medical Center',
    location: 'Riverside',
    distanceKm: 4.5,
    availableBeds: 9,
    icuBeds: 3,
    emergencyQueue: 0,
    departments: { General: 7, Cardiology: 4, Neurology: 2, Emergency: 2, Pulmonology: 3 },
    readiness: 'READY'
  }
];

export const cases: PatientCase[] = [];
export const events: EmergencyEvent[] = [];
