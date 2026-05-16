import { hospitals, patients, cases, events, doctors, SeverityLevel, PatientCase, Hospital, PatientProfile, EmergencyEvent } from './data';

const severityKeywords: Record<SeverityLevel, string[]> = {
  CRITICAL: ['chest pain', 'stroke', 'loss of consciousness', 'severe bleeding', 'unconscious', 'collapsed', 'can\'t breathe'],
  HIGH: ['shortness of breath', 'high fever', 'intense pain', 'severe headache', 'confusion', 'dizziness'],
  MODERATE: ['persistent fever', 'sharp pain', 'rapid heartbeat', 'nausea', 'vomiting', 'persistent cough'],
  LOW: ['mild', 'ache', 'tired', 'fatigue', 'sore', 'lightheaded', 'headache']
};

const diagnosisMap = [
  { keyword: 'chest pain', label: 'Acute coronary syndrome' },
  { keyword: 'shortness of breath', label: 'Respiratory distress / asthma flare' },
  { keyword: 'severe headache', label: 'Migraine or hypertensive crisis' },
  { keyword: 'abdominal pain', label: 'Gastrointestinal event' },
  { keyword: 'fever', label: 'Infection / systemic inflammation' },
  { keyword: 'dizziness', label: 'Vertigo / dehydration' }
];

export function interpretSymptomText(text: string): { severity: SeverityLevel; score: number; suggestions: string[] } {
  const normalized = text.toLowerCase();
  const found: SeverityLevel[] = [];

  for (const level of Object.keys(severityKeywords) as SeverityLevel[]) {
    for (const term of severityKeywords[level]) {
      if (normalized.includes(term)) {
        found.push(level);
      }
    }
  }

  const score = found.reduce((total, level) => {
    switch (level) {
      case 'CRITICAL': return total + 40;
      case 'HIGH': return total + 25;
      case 'MODERATE': return total + 12;
      case 'LOW': return total + 5;
    }
  }, 0) + (normalized.length > 120 ? 5 : 0);

  let severity: SeverityLevel = 'LOW';
  if (score >= 50) severity = 'CRITICAL';
  else if (score >= 30) severity = 'HIGH';
  else if (score >= 15) severity = 'MODERATE';

  const suggestions = diagnosisMap
    .filter(entry => normalized.includes(entry.keyword))
    .map(entry => entry.label)
    .slice(0, 3);

  if (severity === 'CRITICAL' && suggestions.length === 0) {
    suggestions.push('Acute emergency condition');
  }

  return { severity, score: Math.min(score, 100), suggestions };
}

export function buildRiskAnalysis(caseItem: PatientCase, patient: PatientProfile): string {
  const historyRisk = patient.medicalHistory.length > 0 ? 'Existing chronic conditions increase risk.' : 'No major chronic history noted.';
  const emergencyPhrase = caseItem.isEmergency ? 'Emergency route active.' : 'Standard intake pathway.';
  return `AI risk summary: ${caseItem.severity} priority. ${historyRisk} ${emergencyPhrase}`;
}

export function matchHospital(caseItem: PatientCase): Hospital {
  const severityWeight = caseItem.severity === 'CRITICAL' ? 1.5 : caseItem.severity === 'HIGH' ? 1.3 : caseItem.severity === 'MODERATE' ? 1.0 : 0.8;

  const scored = hospitals.map(hospital => {
    const bedScore = hospital.availableBeds + hospital.icuBeds * 1.5;
    const distanceScore = Math.max(0, 10 - hospital.distanceKm);
    const readinessScore = hospital.readiness === 'READY' ? 10 : hospital.readiness === 'ALERT' ? 6 : 4;
    const urgencyBonus = caseItem.severity === 'CRITICAL' ? 6 : caseItem.severity === 'HIGH' ? 4 : 2;
    const total = bedScore * 1.2 + distanceScore * 2 + readinessScore * 3 + urgencyBonus;
    return { hospital, score: total };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].hospital;
}

export function createPreArrivalReport(caseItem: PatientCase, patient: PatientProfile, hospital: Hospital): string {
  return `Pre-arrival intelligence for ${hospital.name}: ${caseItem.severity} alert. Patient ${patient.name}, age ${patient.age}, presents with symptoms: ${caseItem.symptoms}. Suggested diagnoses: ${caseItem.suggestedDiagnosis.join(', ') || 'TBD'}. Prepare ${caseItem.severity === 'CRITICAL' ? 'resuscitation and ICU support' : 'triage and monitoring'}.
Medical history: ${patient.medicalHistory.join(', ') || 'None noted'}; Allergies: ${patient.allergies.join(', ') || 'None'}.`;
}

export function buildPatientHealthTrend(patient: PatientProfile): string[] {
  const trends: string[] = [];
  if (patient.age > 60) {
    trends.push('Age-based preventive care recommended every 6 months.');
  }
  if (patient.medicalHistory.includes('Hypertension')) {
    trends.push('Monitor blood pressure daily and report spikes.');
  }
  if (patient.medicalHistory.includes('Seasonal asthma')) {
    trends.push('Maintain inhaler readiness and avoid triggers.');
  }
  if (trends.length === 0) {
    trends.push('Continue healthy lifestyle and follow routine checkups.');
  }
  return trends;
}

export function createCase(patientId: string, symptoms: string, naturalDescription: string, emergency: boolean): PatientCase {
  const patient = patients.find(item => item.id === patientId);
  const interpretation = interpretSymptomText(`${symptoms} ${naturalDescription}`);
  const caseItem: PatientCase = {
    id: `case-${Date.now()}`,
    patientId,
    createdAt: new Date().toISOString(),
    symptoms: symptoms || naturalDescription,
    naturalDescription,
    severity: interpretation.severity,
    urgencyScore: interpretation.score,
    status: emergency ? 'ASSIGNED' : 'OPEN',
    suggestedDiagnosis: interpretation.suggestions.length > 0 ? interpretation.suggestions : ['Non-specific acute presentation'],
    recommendedActions: emergency
      ? ['Call emergency services', 'Stay calm', 'Do not move if experiencing severe pain']
      : ['Monitor symptoms', 'Seek primary care if condition worsens', 'Keep hydrated'],
    riskAnalysis: '',
    notes: [],
    isEmergency: emergency
  };
  if (patient) {
    caseItem.riskAnalysis = buildRiskAnalysis(caseItem, patient);
  }
  cases.unshift(caseItem);
  return caseItem;
}

export function dispatchEmergency(caseItem: PatientCase): EmergencyEvent {
  const patient = patients.find(item => item.id === caseItem.patientId);
  const hospital = matchHospital(caseItem);
  hospital.availableBeds = Math.max(0, hospital.availableBeds - 1);
  hospital.emergencyQueue += 1;
  if (caseItem.severity === 'CRITICAL') {
    hospital.icuBeds = Math.max(0, hospital.icuBeds - 1);
  }
  const event: EmergencyEvent = {
    id: `event-${Date.now()}`,
    caseId: caseItem.id,
    triggeredAt: new Date().toISOString(),
    severity: caseItem.severity,
    hospitalId: hospital.id,
    status: 'ROUTING',
    patientLocation: patient?.location,
    message: `Emergency dispatch initiated for ${patient?.name}. Assigned to ${hospital.name}.`,
    report: createPreArrivalReport(caseItem, patient!, hospital)
  };
  events.unshift(event);
  caseItem.assignedHospitalId = hospital.id;
  caseItem.status = 'ASSIGNED';
  return event;
}

export function getSystemState() {
  return {
    patients,
    doctors,
    hospitals,
    cases,
    events
  };
}
