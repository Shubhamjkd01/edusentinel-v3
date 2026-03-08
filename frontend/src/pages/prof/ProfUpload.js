import React, { useEffect, useState } from 'react';
import api from '../../api';

const CLASSES = [
  { id: 1, name: 'CS101 - Intro to Programming' },
  { id: 2, name: 'MATH201 - Calculus II' },
  { id: 3, name: 'PHY301 - Physics' },
  { id: 4, name: 'ENG102 - Technical Writing' },
];

export default function ProfUpload() {
  const [tab, setTab]         = useState('attendance');
  const [students, setStudents] = useState([]);
  const [attState, setAttState] = useState({});
  const [scores, setScores]   = useState({});
  const [classId, setClassId] = useState(1);
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle]     = useState('');
  const [scoreType, setScoreType] = useState('assignment');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/students').then(res => {
      setStudents(res.data);
      const state = {};
      res.data.forEach(s => { state[s.id] = true; });
      setAttState(state);
    });
  }, []);

  const toggleAtt = (id) => setAttState(p => ({ ...p, [id]: !p[id] }));

  const submitAttendance = async () => {
    setLoading(true);
    try {
      await api.post('/upload_attendance', {
        class_id: classId,
        date,
        records: students.map(s => ({ student_id: s.id, present: attState[s.id] ?? true })),
      });
      setSuccess('✅ Attendance submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setSuccess('❌ Failed to submit'); }
    setLoading(false);
  };

  const submitScores = async () => {
    if (!title) { setSuccess('❌ Please enter a title'); return; }
    const records = students
      .filter(s => scores[s.id] !== undefined && scores[s.id] !== '')
      .map(s => ({ student_id: s.id, score: parseFloat(scores[s.id]) }));
    if (!records.length) { setSuccess('❌ Please enter at least one score'); return; }
    setLoading(true);
    try {
      await api.post('/upload_scores', { class_id: classId, title, score_type: scoreType, records });
      setSuccess('✅ Scores uploaded successfully!');
      setScores({});
      setTimeout(() => setSuccess(''), 3000);
    } catch { setSuccess('❌ Failed to upload'); }
    setLoading(false);
  };

  return (
    <div>
      <div className="topbar anim">
        <div>
          <div className="pg-title">Upload Data</div>
          <div className="pg-sub">Attendance · Assignments · Exams</div>
        </div>
      </div>

      <div className="upload-tabs anim-d1">
        {[['attendance','📅 Attendance'],['assignment','📝 Assignments'],['exam','📋 Exams']].map(([t, label]) => (
          <div key={t} className={`upload-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setSuccess(''); setScoreType(t); }}>
            {label}
          </div>
        ))}
      </div>

      {/* Common controls */}
      <div className="panel anim-d2">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Class</label>
            <select className="form-input" value={classId} onChange={e => setClassId(Number(e.target.value))}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {tab === 'attendance' ? (
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          ) : (
            <>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="e.g. Assignment 4 / Midterm" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Attendance Grid */}
        {tab === 'attendance' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Click to toggle Present / Absent
            </div>
            <div className="att-grid">
              {students.map(s => (
                <div key={s.id} className={`att-card ${attState[s.id] ? '' : 'absent'}`} onClick={() => toggleAtt(s.id)}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: attState[s.id] ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: attState[s.id] ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                    {attState[s.id] ? '✓' : '✗'}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.full_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={submitAttendance} disabled={loading}>
              {loading ? '⏳ Submitting...' : '📤 Submit Attendance'}
            </button>
          </>
        )}

        {/* Score Grid */}
        {(tab === 'assignment' || tab === 'exam') && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 8, margin: '13px 0' }}>
              {students.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.full_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
                  </div>
                  <input
                    type="number" min={0} max={100}
                    placeholder="—"
                    value={scores[s.id] || ''}
                    onChange={e => setScores(p => ({ ...p, [s.id]: e.target.value }))}
                    style={{ width: 65, textAlign: 'center', padding: '6px 8px', border: '2px solid var(--border)', borderRadius: 7, fontFamily: 'Instrument Mono', fontSize: 13, fontWeight: 700, outline: 'none', background: 'var(--white)' }}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={submitScores} disabled={loading}>
              {loading ? '⏳ Uploading...' : '📤 Upload Scores'}
            </button>
          </>
        )}

        {success && (
          <div className={`success-msg`} style={{ marginTop: 12, background: success.startsWith('✅') ? 'var(--green-l)' : 'var(--red-l)', color: success.startsWith('✅') ? 'var(--green)' : 'var(--red)', border: `2px solid ${success.startsWith('✅') ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
