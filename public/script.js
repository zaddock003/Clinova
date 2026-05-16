document.addEventListener('click', async (e) => {
// Merge of original interactive script with API wiring
const API_BASE = '/api';

async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'API error');
  }
  return res.json();
}

// Attach to some global UI elements for API-driven interactions
document.addEventListener('click', async (ev) => {
  const target = ev.target.closest ? ev.target.closest('button') : null;
  if (!target) return;

  // Accept Case button (doctor panel)
  if (target.innerText && target.innerText.trim().toLowerCase().includes('accept case')) {
    try {
      const state = await api('/state');
      const doctorId = state.doctors?.[0]?.id || 'doctor-001';
      const caseId = state.cases?.[0]?.id;
      if (!caseId) return alert('No active case to accept');
      await api('/doctor/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId, caseId }) });
      alert('Case accepted by doctor.');
    } catch (err) {
      console.error(err);
      alert('Failed to accept case');
    }
  }
});

// Periodic refresh for stats and AI feed
async function refreshStats() {
  try {
    const s = await api('/state');
    document.getElementById('stat-patients').textContent = s.patients.length;
    document.getElementById('stat-doctors').textContent = s.doctors.length;
    document.getElementById('stat-hospitals').textContent = s.hospitals.length;
    document.getElementById('stat-response').textContent = Math.floor(Math.random() * 30) + 5;

    const feed = document.getElementById('ai-feed');
    if (feed) {
      feed.innerHTML = '';
      (s.cases || []).slice(0,5).forEach(c => {
        const div = document.createElement('div');
        div.className = 'text-xs font-mono text-slate-400';
        div.textContent = `${new Date(c.createdAt).toLocaleTimeString()} • ${c.severity} • ${c.symptoms?.substring(0,60)}`;
        feed.appendChild(div);
      });
    }
  } catch (err) {
    console.error('refreshStats failed', err);
  }
}

setInterval(refreshStats, 3000);
refreshStats();
