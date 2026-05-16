import { useEffect, useMemo, useState } from 'react';
import { fetchState, sendSymptomReport, triggerSOS, doctorAccept, doctorUpdate, advanceEvent, allocateHospital } from './services/api';
import type { ClinovaState, PatientCase, Doctor, Hospital, EmergencyEvent, PatientProfile } from './types';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import EmergencyConsole from './components/EmergencyConsole';

const tabs = ['Patient', 'Doctor', 'Hospital', 'Emergency'] as const;

type TabName = (typeof tabs)[number];
type AuthRole = 'Patient' | 'Doctor' | 'Hospital' | 'Guest' | null;

type LoginForm = {
  role: AuthRole;
  email: string;
  password: string;
  extra: string;
  accessKey: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('Patient');
  const [data, setData] = useState<ClinovaState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authRole, setAuthRole] = useState<AuthRole>(null);
  const [authUser, setAuthUser] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabName | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [loginForm, setLoginForm] = useState<LoginForm>({ role: 'Patient', email: '', password: '', extra: '', accessKey: '' });

  const selectedPatient = useMemo<PatientProfile | undefined>(() => data?.patients[0], [data]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const state = await fetchState();
        if (mounted) {
          setData(state);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }
    load();
    const interval = window.setInterval(() => setRefreshKey((prev) => prev + 1), 3000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!activeTab || loading) return;
    fetchState().then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Failed to refresh'));
  }, [activeTab, refreshKey]);

  const handleReport = async (symptoms: string, description: string) => {
    if (!selectedPatient) return;
    await sendSymptomReport(selectedPatient.id, symptoms, description);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSOS = async (symptoms: string, description: string) => {
    if (!selectedPatient) return;
    await triggerSOS(selectedPatient.id, symptoms, description);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDoctorAccept = async (doctorId: string, caseId: string) => {
    await doctorAccept(doctorId, caseId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDoctorUpdate = async (caseId: string, diagnosis: string[], actions: string[], note: string) => {
    await doctorUpdate(caseId, diagnosis, actions, note);
    setRefreshKey((prev) => prev + 1);
  };

  const handleAdvanceEvent = async (eventId: string, status: 'DISPATCHED' | 'ROUTING' | 'ARRIVED') => {
    await advanceEvent(eventId, status);
    setRefreshKey((prev) => prev + 1);
  };

  const handleAllocateHospital = async (hospitalId: string, caseId: string) => {
    await allocateHospital(hospitalId, caseId);
    setRefreshKey((prev) => prev + 1);
  };

  const canAccessTab = (tab: TabName) => {
    if (tab === 'Doctor') return authRole === 'Doctor';
    if (tab === 'Hospital') return authRole === 'Hospital';
    return true;
  };

  const openLogin = (role: AuthRole, nextTab?: TabName) => {
    setLoginForm((current) => ({ ...current, role, email: '', password: '', extra: '', accessKey: '' }));
    setAuthMessage('');
    setPendingTab(nextTab ?? null);
    setLoginOpen(true);
  };

  const handleTabClick = (tab: TabName) => {
    if ((tab === 'Doctor' || tab === 'Hospital') && !canAccessTab(tab)) {
      openLogin(tab, tab);
      return;
    }
    setActiveTab(tab);
  };

  const handleLogin = () => {
    const { role, email, password, extra, accessKey } = loginForm;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedExtra = extra.trim();
    const normalizedKey = accessKey.trim();
    let valid = false;

    if (role === 'Doctor') {
      valid = normalizedEmail === 'doctor@clinova.ai' && password === 'DocSecure123!' && normalizedExtra === 'MD-4821' && normalizedKey === 'DR-ACCESS-82';
      if (!valid) {
        setAuthMessage('Doctor login failed. Confirm email, password, license ID, and access key.');
        return;
      }
    }

    if (role === 'Hospital') {
      valid = normalizedEmail === 'hospital@citymed.ai' && password === 'HospSecure123!' && normalizedExtra === 'HOSP-7702' && normalizedKey === 'HOSP-KEY-56';
      if (!valid) {
        setAuthMessage('Hospital login failed. Confirm email, password, facility code, and access key.');
        return;
      }
    }

    if (role === 'Patient' || role === 'Guest') {
      valid = normalizedEmail.includes('@') && password.length >= 8;
      if (!valid) {
        setAuthMessage('Enter a valid email and password with at least 8 characters.');
        return;
      }
    }

    if (valid) {
      setAuthRole(role);
      setAuthUser(normalizedEmail);
      setLoginOpen(false);
      setAuthMessage('');
      setActiveTab(pendingTab ?? (role === 'Doctor' ? 'Doctor' : role === 'Hospital' ? 'Hospital' : 'Patient'));
      setPendingTab(null);
    }
  };

  const handleLogout = () => {
    setAuthRole(null);
    setAuthUser(null);
    setActiveTab('Patient');
    setAuthMessage('Logged out successfully.');
    setTimeout(() => setAuthMessage(''), 3000);
  };

  return (
    <div className="app-shell">
      <header className="hero-bar">
        <div>
          <h1>Clinova</h1>
          <p>The AI-powered healthcare intelligence network.</p>
          {authRole && authUser ? (
            <div className="auth-chip">Signed in as {authRole} • {authUser}</div>
          ) : (
            <div className="auth-chip guest">Not signed in</div>
          )}
        </div>

        <div className="hero-actions">
          <button className="primary" onClick={() => openLogin(authRole === 'Doctor' ? 'Doctor' : authRole === 'Hospital' ? 'Hospital' : 'Patient')}>Sign In</button>
          {authRole && (
            <button className="danger" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      <nav className="tab-nav" aria-label="Dashboard tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content-panel">
        {loading && <div className="status-banner">Loading Clinova network status...</div>}
        {error && <div className="status-banner error">Error: {error}</div>}
        {authMessage && <div className="status-banner">{authMessage}</div>}

        {!loading && data && selectedPatient && (
          <>
            <section className="overview-cards">
              <div className="card">
                <strong>Active cases</strong>
                <span>{data.cases.length}</span>
              </div>
              <div className="card">
                <strong>Hospitals online</strong>
                <span>{data.hospitals.length}</span>
              </div>
              <div className="card">
                <strong>Emergency queue</strong>
                <span>{data.events.filter((event) => event.status !== 'ARRIVED').length}</span>
              </div>
            </section>

            {activeTab === 'Patient' && (
              <PatientDashboard
                patient={selectedPatient}
                cases={data.cases.filter((caseItem) => caseItem.patientId === selectedPatient.id)}
                events={data.events.filter((event) => data.cases.some((caseItem) => caseItem.id === event.caseId && caseItem.patientId === selectedPatient.id))}
                onReport={handleReport}
                onSOS={handleSOS}
              />
            )}
            {activeTab === 'Doctor' && canAccessTab('Doctor') && (
              <DoctorDashboard
                doctors={data.doctors}
                cases={data.cases}
                hospitals={data.hospitals}
                onAccept={handleDoctorAccept}
                onUpdate={handleDoctorUpdate}
                onAllocateHospital={handleAllocateHospital}
              />
            )}
            {activeTab === 'Hospital' && canAccessTab('Hospital') && (
              <HospitalDashboard
                hospitals={data.hospitals}
                cases={data.cases}
                events={data.events}
                patients={data.patients}
                onAllocateHospital={handleAllocateHospital}
              />
            )}
            {activeTab === 'Emergency' && (
              <EmergencyConsole
                events={data.events}
                cases={data.cases}
                patients={data.patients}
                hospitals={data.hospitals}
                onAdvanceEvent={handleAdvanceEvent}
              />
            )}
          </>
        )}
      </main>

      {loginOpen && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h2>Clinova Secure Login</h2>
            <p className="modal-copy">Doctor and Hospital dashboards require verified credentials. Provide the details below to continue.</p>
            <div className="form-grid">
              <label>
                Role
                <select
                  value={loginForm.role ?? 'Patient'}
                  onChange={(event) => setLoginForm((current) => ({ ...current, role: event.target.value as AuthRole }))}
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Hospital">Hospital</option>
                </select>
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@organization.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Secure password"
                />
              </label>
              {(loginForm.role === 'Doctor' || loginForm.role === 'Hospital') && (
                <label>
                  {loginForm.role === 'Doctor' ? 'Medical License ID' : 'Facility Code'}
                  <input
                    type="text"
                    value={loginForm.extra}
                    onChange={(event) => setLoginForm((current) => ({ ...current, extra: event.target.value }))}
                    placeholder={loginForm.role === 'Doctor' ? 'MD-4821' : 'HOSP-7702'}
                  />
                </label>
              )}
              {(loginForm.role === 'Doctor' || loginForm.role === 'Hospital') && (
                <label>
                  Access Key
                  <input
                    type="text"
                    value={loginForm.accessKey}
                    onChange={(event) => setLoginForm((current) => ({ ...current, accessKey: event.target.value }))}
                    placeholder={loginForm.role === 'Doctor' ? 'DR-ACCESS-82' : 'HOSP-KEY-56'}
                  />
                </label>
              )}
            </div>
            <div className="button-row">
              <button className="primary" onClick={handleLogin}>Submit</button>
              <button className="danger" onClick={() => setLoginOpen(false)}>Cancel</button>
            </div>
            <div className="login-hint">
              {pendingTab === 'Doctor' && 'Doctor access requires license ID and a secure access key.'}
              {pendingTab === 'Hospital' && 'Hospital access requires facility code and access key.'}
              {!pendingTab && 'Any patient may sign in with an email and password.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
