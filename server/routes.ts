import express from 'express';
import { patients, doctors, hospitals, cases, events, PatientProfile, Hospital, PatientCase, SeverityLevel } from './data';
import { createCase, dispatchEmergency, getSystemState, interpretSymptomText, matchHospital, buildRiskAnalysis, createPreArrivalReport } from './engine';

const router = express.Router();

router.get('/state', (req, res) => {
  res.json(getSystemState());
});

router.post('/patient/report', (req, res) => {
  const { patientId, symptoms, description } = req.body;
  if (!patientId || (!symptoms && !description)) {
    return res.status(400).json({ error: 'Patient ID and symptom details are required.' });
  }

  const newCase = createCase(patientId, symptoms ?? '', description ?? '', false);
  res.json({ case: newCase, message: 'Patient case created and queued for doctor review.' });
});

router.post('/patient/sos', (req, res) => {
  const { patientId, symptoms, description } = req.body;
  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required.' });
  }

  const newCase = createCase(patientId, symptoms ?? '', description ?? '', true);
  const event = dispatchEmergency(newCase);
  res.json({ case: newCase, event, message: 'SOS triggered. Emergency coordination active.' });
});

router.post('/doctor/accept', (req, res) => {
  const { doctorId, caseId } = req.body;
  const doctor = doctors.find(item => item.id === doctorId);
  const caseItem = cases.find(item => item.id === caseId);
  if (!doctor || !caseItem) {
    return res.status(404).json({ error: 'Doctor or case not found.' });
  }
  caseItem.assignedDoctorId = doctor.id;
  caseItem.status = 'IN_PROGRESS';
  res.json({ case: caseItem, message: 'Doctor accepted case.' });
});

router.post('/doctor/update', (req, res) => {
  const { caseId, diagnosis, actions, note } = req.body;
  const caseItem = cases.find(item => item.id === caseId);
  if (!caseItem) {
    return res.status(404).json({ error: 'Case not found.' });
  }
  if (diagnosis) caseItem.suggestedDiagnosis = diagnosis;
  if (actions) caseItem.recommendedActions = actions;
  if (note) caseItem.notes.push(note);
  caseItem.status = 'IN_PROGRESS';
  res.json({ case: caseItem, message: 'Case updated by doctor.' });
});

router.post('/hospital/allocate', (req, res) => {
  const { hospitalId, caseId } = req.body;
  const hospital = hospitals.find(item => item.id === hospitalId);
  const caseItem = cases.find(item => item.id === caseId);
  if (!hospital || !caseItem) {
    return res.status(404).json({ error: 'Hospital or case not found.' });
  }
  if (hospital.availableBeds > 0) {
    hospital.availableBeds -= 1;
    caseItem.assignedHospitalId = hospital.id;
    caseItem.status = 'ASSIGNED';
    return res.json({ hospital, case: caseItem, message: 'Hospital bed allocated.' });
  }
  res.status(400).json({ error: 'No beds available at this hospital.' });
});

router.post('/emergency/advance', (req, res) => {
  const { eventId, status } = req.body as { eventId: string; status: 'DISPATCHED' | 'ROUTING' | 'ARRIVED' };
  const event = events.find(item => item.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  event.status = status;
  res.json({ event });
});

export default router;
