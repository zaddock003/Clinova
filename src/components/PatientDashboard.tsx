import { useMemo, useState } from 'react';
import type { PatientProfile, PatientCase, EmergencyEvent } from '../types';

type Props = {
  patient: PatientProfile;
  cases: PatientCase[];
  events: EmergencyEvent[];
  onReport: (symptoms: string, description: string) => Promise<void>;
  onSOS: (symptoms: string, description: string) => Promise<void>;
};

export default function PatientDashboard({ patient, cases, events, onReport, onSOS }: Props) {
  const [symptoms, setSymptoms] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const latestCase = useMemo(() => cases[0], [cases]);
  const latestEvent = useMemo(() => events[0], [events]);

  const handleSubmit = async () => {
    setMessage('Submitting symptom report...');
    await onReport(symptoms, description);
    setSymptoms('');
    setDescription('');
    setMessage('Symptom report submitted. Monitoring network response.');
  };

  const handleSOS = async () => {
    setMessage('Triggering SOS emergency...');
    await onSOS(symptoms, description);
    setMessage('SOS activated. Emergency coordination in progress.');
  };

  return (
    <div className="dashboard-grid">
      <div className="panel">
        <h2>Patient Profile</h2>
        <div className="profile-card">
          <div>
            <strong>{patient.name}</strong>
            <span>{patient.age} years</span>
          </div>
          <div>{patient.gender || 'Gender not specified'}</div>
          <div>Location: {patient.location}</div>
          <div>Medical history: {patient.medicalHistory.join(', ') || 'None'}</div>
          <div>Allergies: {patient.allergies.join(', ') || 'None'}</div>
          <div>Current conditions: {patient.currentConditions.join(', ') || 'Stable'}</div>
        </div>
      </div>

      <div className="panel">
        <h2>Symptom Reporter</h2>
        <textarea
          rows={3}
          placeholder="Enter symptoms (e.g. tight chest, shortness of breath)"
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
        />
        <textarea
          rows={3}
          placeholder="Describe how you feel in your own words"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="button-row">
          <button className="primary" onClick={handleSubmit}>Submit report</button>
          <button className="danger" onClick={handleSOS}>SOS</button>
        </div>
        {message && <div className="status-box">{message}</div>}
      </div>

      <div className="panel full-width">
        <h2>Live Patient Status</h2>
        {latestCase ? (
          <div className="case-card">
            <div className="card-title">Latest case</div>
            <div>Severity: {latestCase.severity}</div>
            <div>Urgency score: {latestCase.urgencyScore}%</div>
            <div>Status: {latestCase.status}</div>
            <div>AI risk: {latestCase.riskAnalysis}</div>
            <div>Suggested diagnosis: {latestCase.suggestedDiagnosis.join(', ')}</div>
            <div>Recommended actions: {latestCase.recommendedActions.join(', ')}</div>
            {latestCase.notes.length > 0 && <div>Notes: {latestCase.notes.join(' | ')}</div>}
          </div>
        ) : (
          <div className="info-box">No active cases yet. Submit symptoms or use SOS to engage Clinova.</div>
        )}
        {latestEvent ? (
          <div className="event-card">
            <div className="card-title">Emergency dispatch</div>
            <div>{latestEvent.message}</div>
            <div>Hospital assignment: {latestEvent.hospitalId || 'Pending'}</div>
            <div>Route status: {latestEvent.status}</div>
            <div>Report: {latestEvent.report}</div>
          </div>
        ) : (
          <div className="info-box">No emergency activity detected at this time.</div>
        )}
      </div>

      <div className="panel full-width">
        <h2>Health Insights</h2>
        <ul>
          {patient.healthInsights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
