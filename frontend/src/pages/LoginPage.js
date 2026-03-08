import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DEMO_ACCOUNTS = {
  professor: [
    { username: 'prof_sharma', password: 'teach@123', name: 'Dr. Rajesh Sharma',  dept: 'Computer Science' },
    { username: 'prof_verma',  password: 'teach@123', name: 'Prof. Anita Verma',  dept: 'Mathematics' },
    { username: 'prof_mehta',  password: 'teach@123', name: 'Dr. Suresh Mehta',   dept: 'Physics' },
  ],
  student: [
    { username: 'aarav.sharma',  password: 'student@123', name: 'Aarav Sharma',  roll: '2021CS001 ⚠️ At Risk' },
    { username: 'priya.patel',   password: 'student@123', name: 'Priya Patel',   roll: '2021CS002 ✅ Safe' },
    { username: 'kavya.reddy',   password: 'student@123', name: 'Kavya Reddy',   roll: '2021CS006 ✅ Safe' },
    { username: 'rohan.gupta',   password: 'student@123', name: 'Rohan Gupta',   roll: '2021CS003 ⚠️ At Risk' },
  ],
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('professor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (u = username, p = password) => {
    if (!u || !p) { setError('Please enter username and password'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { username: u, password: p });
      const { access_token, role: userRole, full_name, user_id } = res.data;
      localStorage.setItem('edu_token', access_token);
      localStorage.setItem('edu_role', userRole);
      localStorage.setItem('edu_name', full_name);
      localStorage.setItem('edu_uid', user_id);
      navigate(userRole === 'professor' ? '/professor' : '/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    handleLogin(acc.username, acc.password);
  };

  const demos = DEMO_ACCOUNTS[role];

  return (
    <div style={styles.outer}>
      {/* Floating background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        {/* Card Header */}
        <div style={styles.header}>
          <div style={styles.headerRing1} />
          <div style={styles.headerRing2} />
          <div style={styles.shield}>🛡️</div>
          <h1 style={styles.brandTitle}>EduSentinel</h1>
          <p style={styles.brandSub}>Academic Intelligence Platform</p>
          <div style={styles.featurePills}>
            {['🤖 AI Risk Detection', '🏆 Activity Tracking', '📚 Self Learning'].map(f => (
              <span key={f} style={styles.featurePill}>{f}</span>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div style={styles.body}>
          {/* Role Toggle */}
          <div style={styles.roleRow}>
            {['professor', 'student'].map(r => (
              <button
                key={r}
                style={{ ...styles.roleBtn, ...(role === r ? styles.roleBtnActive : {}) }}
                onClick={() => { setRole(r); setError(''); }}
              >
                {r === 'professor' ? '👨‍🏫 Professor' : '🎓 Student'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Fields */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>USERNAME</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                style={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={role === 'professor' ? 'e.g. prof_sharma' : 'e.g. aarav.sharma'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PASSWORD</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <button
            style={{ ...styles.loginBtn, ...(loading ? styles.loginBtnDisabled : {}) }}
            onClick={() => handleLogin()}
            disabled={loading}
          >
            {loading ? (
              <><span style={styles.spinner} />Authenticating...</>
            ) : (
              `Sign in as ${role === 'professor' ? 'Professor' : 'Student'} →`
            )}
          </button>

          {/* Demo Accounts */}
          <div style={styles.demoSection}>
            <div style={styles.demoTitle}>QUICK LOGIN — CLICK ANY ACCOUNT</div>
            <div style={styles.demoList}>
              {demos.map(acc => (
                <div key={acc.username} style={styles.demoRow} onClick={() => quickLogin(acc)}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, styles.demoRowHover)}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#f0f4ff', transform: 'none' })}
                >
                  <div style={styles.demoLeft}>
                    <div style={{ ...styles.demoAvatar, background: role === 'professor' ? 'linear-gradient(135deg,#3a5bd9,#6c3fd8)' : 'linear-gradient(135deg,#059669,#0891b2)' }}>
                      {acc.name[0]}
                    </div>
                    <div>
                      <div style={styles.demoName}>{acc.name}</div>
                      <div style={styles.demoMeta}>{acc.dept || acc.roll}</div>
                    </div>
                  </div>
                  <span style={styles.demoCred}>{acc.password}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outer: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#e8eef8 0%,#f0f4ff 40%,#ece8ff 100%)',
    position: 'relative', overflow: 'hidden', padding: '24px',
  },
  blob1: { position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(58,91,217,0.12),transparent)', top: -120, left: -100, pointerEvents: 'none' },
  blob2: { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,63,216,0.1),transparent)', bottom: -80, right: -80, pointerEvents: 'none' },
  blob3: { position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(8,145,178,0.08),transparent)', top: '60%', left: '10%', pointerEvents: 'none' },
  card: {
    position: 'relative', zIndex: 10, width: '100%', maxWidth: 460,
    background: '#fff', borderRadius: 24,
    boxShadow: '0 4px 6px rgba(0,0,0,0.04),0 20px 60px rgba(58,91,217,0.15)',
    overflow: 'hidden', animation: 'cardEntrance 0.5s cubic-bezier(.34,1.56,.64,1) both',
  },
  header: {
    padding: '36px 36px 28px', textAlign: 'center',
    background: 'linear-gradient(145deg,#3a5bd9 0%,#6c3fd8 100%)',
    position: 'relative', overflow: 'hidden',
  },
  headerRing1: { position: 'absolute', width: 200, height: 200, top: -60, right: -60, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' },
  headerRing2: { position: 'absolute', width: 120, height: 120, bottom: -30, left: -30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' },
  shield: { fontSize: 36, display: 'block', marginBottom: 12, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))', position: 'relative', zIndex: 1 },
  brandTitle: { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -1, position: 'relative', zIndex: 1 },
  brandSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 5, position: 'relative', zIndex: 1 },
  featurePills: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14, flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  featurePill: { padding: '4px 11px', background: 'rgba(255,255,255,0.12)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' },
  body: { padding: '28px 32px 32px' },
  roleRow: { display: 'flex', background: '#f0f4ff', border: '2px solid #dde3f0', borderRadius: 12, padding: 4, marginBottom: 22 },
  roleBtn: { flex: 1, padding: '9px 8px', textAlign: 'center', cursor: 'pointer', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#7a88aa', transition: 'all 0.2s', border: 'none', background: 'transparent', fontFamily: 'inherit' },
  roleBtnActive: { background: '#fff', color: '#3a5bd9', boxShadow: '0 2px 10px rgba(58,91,217,0.15)', border: '1px solid rgba(58,91,217,0.15)' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16, animation: 'shake 0.3s ease' },
  fieldGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#3d4a6b', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7 },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 14px 11px 38px', border: '2px solid #dde3f0', borderRadius: 10, background: '#f0f4ff', color: '#0f1629', fontSize: 14, fontFamily: 'inherit', fontWeight: 500, outline: 'none' },
  loginBtn: { width: '100%', padding: 13, background: 'linear-gradient(135deg,#3a5bd9,#6c3fd8)', color: 'white', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  loginBtnDisabled: { opacity: 0.75, cursor: 'not-allowed' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' },
  demoSection: { borderTop: '2px solid #dde3f0', paddingTop: 16 },
  demoTitle: { fontSize: 10, fontWeight: 700, color: '#7a88aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' },
  demoList: { display: 'flex', flexDirection: 'column', gap: 6 },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f4ff', borderRadius: 9, border: '1.5px solid #dde3f0', cursor: 'pointer', transition: 'all 0.15s' },
  demoRowHover: { background: '#eef1fd', transform: 'translateX(3px)', borderColor: '#3a5bd9' },
  demoLeft: { display: 'flex', alignItems: 'center', gap: 9 },
  demoAvatar: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 },
  demoName: { fontSize: 13, fontWeight: 700, color: '#0f1629' },
  demoMeta: { fontSize: 10, color: '#7a88aa' },
  demoCred: { fontFamily: 'Instrument Mono, monospace', fontSize: 11, color: '#3a5bd9', fontWeight: 500, background: '#eef1fd', padding: '2px 7px', borderRadius: 6 },
};
