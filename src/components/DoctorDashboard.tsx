import { useMemo, useState } from 'react';
import type { Doctor, PatientCase, Hospital } from '../types';

type Props = {
  doctors: Doctor[];
  cases: PatientCase[];
  hospitals: Hospital[];
  onAccept: (doctorId: string, caseId: string) => Promise<void>;
  onUpdate: (caseId: string, diagnosis: string[], actions: string[], note: string) => Promise<void>;
  onAllocateHospital: (hospitalId: string, caseId: string) => Promise<void>;
};

export default function DoctorDashboard({ doctors, cases, hospitals, onAccept, onUpdate, onAllocateHospital }: Props) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [diagnosisText, setDiagnosisText] = useState('');
  const [actionsText, setActionsText] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const openCases = useMemo(() => cases.filter((caseItem) => caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS'), [cases]);
  const selectedCase = openCases.find((item) => item.id === selectedCaseId) || openCases[0];

  const handleAcceptCase = async (doctorId: string, caseId: string) => {
    setMessage('Accepting case for review...');
    await onAccept(doctorId, caseId);
    setMessage('Case accepted and doctor is now assigned.');
  };

  const handleSubmitUpdate = async () => {
    if (!selectedCase) return;
    setMessage('Sending medical summary to Clinova...');
    await onUpdate(selectedCase.id, diagnosisText.split(',').map((item) => item.trim()).filter(Boolean), actionsText.split(',').map((item) => item.trim()).filter(Boolean), note);
    setDiagnosisText('');
    setActionsText('');
    setNote('');
    setMessage('Doctor update submitted. Cases refreshed.');
  };

  return (
    <div className="dashboard-grid">
      <div className="panel full-width">
        <h2>Incoming Cases Queue</h2>
        {openCases.length === 0 ? (
          <div className="info-box">No active patient cases are waiting right now.</div>
        ) : (
          <div className="case-list">
            {openCases.map((caseItem) => (
              <button
                key={caseItem.id}
                className={selectedCase?.id === caseItem.id ? 'case-summary selected' : 'case-summary'}
                onClick={() => setSelectedCaseId(caseItem.id)}
              >
                <div>{caseItem.symptoms || caseItem.naturalDescription}</div>
                <small>{caseItem.severity} • {caseItem.status}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCase ? (
        <>
          <div className="panel">
            <h2>Case Details</h2>
            <div className="case-card">
              <div className="card-title">{selectedCase.symptoms || selectedCase.naturalDescription}</div>
              <div>Severity: {selectedCase.severity}</div>
              <div>Status: {selectedCase.status}</div>
              <div>AI risk: {selectedCase.riskAnalysis}</div>
              <div>Diagnosis suggestions: {selectedCase.suggestedDiagnosis.join(', ')}</div>
              <div>Recommended actions: {selectedCase.recommendedActions.join(', ')}</div>
              {selectedCase.notes.length > 0 && <div>Notes: {selectedCase.notes.join(' | ')}</div>}
            </div>
            <div className="button-row wrap">
              {doctors.map((doctor) => (
                <button key={doctor.id} onClick={() => handleAcceptCase(doctor.id, selectedCase.id)}>
                  Assign to {doctor.name}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>AI Medical Assistant</h2>
            <textarea
              rows={2}
              placeholder="Update diagnosis (comma-separated)"
              value={diagnosisText}
              onChange={(event) => setDiagnosisText(event.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Recommended actions (comma-separated)"
              value={actionsText}
              onChange={(event) => setActionsText(event.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Add a clinical note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <button className="primary" onClick={handleSubmitUpdate}>Update case</button>
            {message && <div className="status-box">{message}</div>}
          </div>

          <div className="panel full-width">
            <h2>Hospital Match Suggestions</h2>
            <div className="grid-split">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="hospital-card">
                  <div className="card-title">{hospital.name}</div>
                  <div>Location: {hospital.location}</div>
                  <div>Beds: {hospital.availableBeds}</div>
                  <div>ICU beds: {hospital.icuBeds}</div>
                  <div>Readiness: {hospital.readiness}</div>
                  <button onClick={() => onAllocateHospital(hospital.id, selectedCase.id)}>Allocate</button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="panel full-width info-box">Select an incoming case to review and manage.</div>
      )}
    </div>
  );
}
