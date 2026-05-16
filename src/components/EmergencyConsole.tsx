import type { EmergencyEvent, PatientCase, PatientProfile, Hospital } from '../types';

type Props = {
  events: EmergencyEvent[];
  cases: PatientCase[];
  patients: PatientProfile[];
  hospitals: Hospital[];
  onAdvanceEvent: (eventId: string, status: 'DISPATCHED' | 'ROUTING' | 'ARRIVED') => Promise<void>;
};

export default function EmergencyConsole({ events, cases, patients, hospitals, onAdvanceEvent }: Props) {
  return (
    <div className="dashboard-grid">
      <div className="panel full-width">
        <h2>Emergency Intelligence System</h2>
        <div className="info-box">
          Clinova AI continuously evaluates incoming data, triages severity, matches patients to hospitals, and simulates ambulance routing.
        </div>
      </div>

      <div className="panel full-width">
        <h2>Live Emergency Events</h2>
        {events.length === 0 ? (
          <div className="info-box">No active emergency routes at the moment.</div>
        ) : (
          <div className="case-list">
            {events.map((event) => {
              const caseItem = cases.find((item) => item.id === event.caseId);
              const patient = patients.find((item) => item.id === caseItem?.patientId);
              const hospital = hospitals.find((item) => item.id === event.hospitalId);
              return (
                <div key={event.id} className="case-card">
                  <div className="card-title">{patient?.name} → {hospital?.name || 'TBD'}</div>
                  <div>Severity: {event.severity}</div>
                  <div>Route: {event.status}</div>
                  <div>Location: {event.patientLocation}</div>
                  <div>{event.message}</div>
                  <div className="button-row wrap">
                    <button onClick={() => onAdvanceEvent(event.id, 'DISPATCHED')}>Mark dispatched</button>
                    <button onClick={() => onAdvanceEvent(event.id, 'ROUTING')}>Mark routing</button>
                    <button onClick={() => onAdvanceEvent(event.id, 'ARRIVED')}>Mark arrived</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel full-width">
        <h2>Predicted Condition Report</h2>
        {events.map((event) => {
          const caseItem = cases.find((item) => item.id === event.caseId);
          if (!caseItem) return null;
          return (
            <div key={`report-${event.id}`} className="case-card">
              <div>{event.report}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
