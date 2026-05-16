import type { Hospital, PatientCase, EmergencyEvent, PatientProfile } from '../types';

type Props = {
  hospitals: Hospital[];
  cases: PatientCase[];
  events: EmergencyEvent[];
  patients: PatientProfile[];
  onAllocateHospital: (hospitalId: string, caseId: string) => Promise<void>;
};

export default function HospitalDashboard({ hospitals, cases, events, patients, onAllocateHospital }: Props) {
  const assignedCases = cases.filter((caseItem) => caseItem.assignedHospitalId);

  return (
    <div className="dashboard-grid">
      <div className="panel full-width">
        <h2>Hospital Status Panel</h2>
        <div className="grid-split">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="hospital-card">
              <div className="card-title">{hospital.name}</div>
              <div>Location: {hospital.location}</div>
              <div>Distance: {hospital.distanceKm} km</div>
              <div>Available beds: {hospital.availableBeds}</div>
              <div>ICU beds: {hospital.icuBeds}</div>
              <div>Emergency queue: {hospital.emergencyQueue}</div>
              <div>Readiness: {hospital.readiness}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel full-width">
        <h2>Incoming Emergency Feed</h2>
        {events.length === 0 ? (
          <div className="info-box">No active emergency transfers at this time.</div>
        ) : (
          <div className="case-list">
            {events.map((event) => {
              const caseItem = cases.find((item) => item.id === event.caseId);
              const patient = patients.find((item) => item.id === caseItem?.patientId);
              const hospital = hospitals.find((item) => item.id === event.hospitalId);
              return (
                <div key={event.id} className="case-card">
                  <div className="card-title">{hospital?.name || 'Pending hospital'}</div>
                  <div>Patient: {patient?.name}</div>
                  <div>Severity: {event.severity}</div>
                  <div>Route status: {event.status}</div>
                  <div>Reported at: {new Date(event.triggeredAt).toLocaleTimeString()}</div>
                  <div>Location: {event.patientLocation}</div>
                  <div>{event.message}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel full-width">
        <h2>Resource Management</h2>
        <div className="info-box">
          Clinova dynamically prioritizes patients by severity and assigns hospitals using capacity, proximity, and specialization.
        </div>
        {assignedCases.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Patient</th>
                <th>Hospital</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedCases.map((caseItem) => {
                const patient = patients.find((item) => item.id === caseItem.patientId);
                const hospital = hospitals.find((item) => item.id === caseItem.assignedHospitalId);
                return (
                  <tr key={caseItem.id}>
                    <td>{caseItem.severity}</td>
                    <td>{patient?.name}</td>
                    <td>{hospital?.name}</td>
                    <td>{caseItem.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
