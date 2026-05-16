import { describe, it, expect, beforeEach } from 'vitest';
import { interpretSymptomText, createPreArrivalReport, createCase, dispatchEmergency } from '../engine';
import { patients, hospitals, cases, events } from '../data';

describe('Clinova engine core behaviors', () => {
  beforeEach(() => {
    // simple reset of in-memory lists to stable starting state for tests
    // Note: mutate arrays in-place to preserve references used by imports
    cases.length = 0;
    events.length = 0;
    // restore hospital capacities to known baseline
    hospitals[0].availableBeds = 12; hospitals[0].icuBeds = 4; hospitals[0].emergencyQueue = 1;
    hospitals[1].availableBeds = 5; hospitals[1].icuBeds = 2; hospitals[1].emergencyQueue = 3;
    hospitals[2].availableBeds = 9; hospitals[2].icuBeds = 3; hospitals[2].emergencyQueue = 0;
  });

  it('interprets critical symptom text', () => {
    const res = interpretSymptomText("Severe chest pain and can't breathe suddenly");
    expect(res.severity).toBe('CRITICAL');
    expect(res.score).toBeGreaterThanOrEqual(50);
  });

  it('creates a case and dispatches emergency reducing total bed count by one', () => {
    const totalBedsBefore = hospitals.reduce((s, h) => s + h.availableBeds, 0);
    const c = createCase('patient-001', "chest pain can't breathe", 'Patient collapsed, unresponsive', true);
    const event = dispatchEmergency(c);
    const totalBedsAfter = hospitals.reduce((s, h) => s + h.availableBeds, 0);
    expect(event.hospitalId).toBeDefined();
    expect(totalBedsAfter).toBe(totalBedsBefore - 1);
    expect(c.status).toBe('ASSIGNED');
  });

  it('prepares a pre-arrival report containing patient name and hospital', () => {
    const c = createCase('patient-001', 'high fever and cough', 'Rapid escalation of temperature', false);
    const hosp = hospitals[0];
    const report = createPreArrivalReport(c, patients[0], hosp);
    expect(report).toContain(patients[0].name);
    expect(report).toContain(hosp.name);
  });
});
