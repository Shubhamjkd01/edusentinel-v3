import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import API from '../api';

export default function LoginPage() {
  const [tab, setTab] = useState('professor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/login', { username, password });
      const { access_token, role, user_id, full_name } = res.data;
      if (role !== tab) {
        setError(`This is a ${role} account. Please select the correct login type.`);
        setLoading(false);
        return;
      }
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('fullName', full_name);
      navigate(role === 'professor' ? '/professor' : '/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const hints = tab === 'professor'
    ? [{ u: 'prof_smith', p: 'password123' }, { u: 'prof_jones', p: 'password123' }]
    : [{ u: 'alice_j', p: 'password123' }, { u: 'grace_t', p: 'password123' }];

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <ShieldCheck size={28} color="var(--accent)" />
            <h1>Edu<span style={{ color: 'var(--accent)' }}>Sentinel</span></h1>
          </div>
          <p>Academic Risk Detection Platform</p>
        </div>
        <div className="login-tabs">
          <div className={`login-tab ${tab === 'professor' ? 'active' : ''}`}
            onClick={() => { setTab('professor'); setError(''); }}>
            👨‍🏫 Professor
          </div>
          <div className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => { setTab('student'); setError(''); }}>
            🎓 Student
          </div>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text"
              placeholder={tab === 'professor' ? 'e.g. prof_smith' : 'e.g. alice_j'}
              value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : `Sign in as ${tab === 'professor' ? 'Professor' : 'Student'}`}
          </button>
        </form>
        <div className="login-hint">
          <div style={{ marginBottom: 6, fontWeight: 600, color: 'var(--text-muted)' }}>Demo accounts:</div>
          {hints.map(h => (
            <div key={h.u} style={{ marginBottom: 2 }}>
              <code>{h.u}</code> / <code>{h.p}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}