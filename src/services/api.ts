import type { ClinovaState, PatientCase } from '../types';

const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

export async function fetchState(): Promise<ClinovaState> {
  return request('/state');
}

export async function sendSymptomReport(patientId: string, symptoms: string, description: string) {
  return request('/patient/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, symptoms, description })
  });
}

export async function triggerSOS(patientId: string, symptoms: string, description: string) {
  return request('/patient/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, symptoms, description })
  });
}

export async function doctorAccept(doctorId: string, caseId: string) {
  return request('/doctor/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId, caseId })
  });
}

export async function doctorUpdate(caseId: string, diagnosis: string[], actions: string[], note: string) {
  return request('/doctor/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, diagnosis, actions, note })
  });
}

export async function advanceEvent(eventId: string, status: 'DISPATCHED' | 'ROUTING' | 'ARRIVED') {
  return request('/emergency/advance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, status })
  });
}

export async function allocateHospital(hospitalId: string, caseId: string) {
  return request('/hospital/allocate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hospitalId, caseId })
  });
}
