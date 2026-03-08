import React, { useState, useEffect } from 'react';
import { Upload, Calendar } from 'lucide-react';
import API from '../api';

function AttendanceUploader({ classes, students }) {
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (id) => setRecords(r => ({ ...r, [id]: !r[id] }));

  const submit = async () => {
    if (!classId) return setMsg('Please select a class');
    const recs = students.map(s => ({ student_id: s.id, date, present: records[s.id] !== false }));
    setLoading(true);
    try {
      await API.post('/upload_attendance', { class_id: parseInt(classId), records: recs });
      setMsg('✅ Attendance uploaded successfully!');
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.detail || 'Upload failed'));
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="section-title"><Calendar size={16} /> Upload Attendance</div>
      <div className="upload-row" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Class</label>
          <select className="form-input" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      {classId && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Mark Attendance</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 8 }}>
            {students.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  background: records[s.id] === false ? 'var(--danger-bg)' : 'var(--safe-bg)',
                  border: `1px solid ${records[s.id] === false ? 'var(--danger)' : 'var(--safe)'}` }}>
                <span>{records[s.id] === false ? '✗' : '✓'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{s.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {msg && <div style={{ marginBottom: 12, fontSize: 13, color: msg.startsWith('✅') ? 'var(--safe)' : 'var(--danger)' }}>{msg}</div>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        <Upload size={14} /> {loading ? 'Uploading...' : 'Submit Attendance'}
      </button>
    </div>
  );
}

function ScoreUploader({ classes, students, scoreType, label }) {
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [scores, setScores] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!classId || !title) return setMsg('Please fill in all fields');
    const recs = students.filter(s => scores[s.id]).map(s => ({
      student_id: s.id, score: parseFloat(scores[s.id]), max_score: 100, title
    }));
    if (!recs.length) return setMsg('Please enter at least one score');
    setLoading(true);
    try {
      await API.post('/upload_scores', { class_id: parseInt(classId), score_type: scoreType, records: recs });
      setMsg('✅ Scores uploaded!');
      setScores({});
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.detail || 'Upload failed'));
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="section-title">{label}</div>
      <div className="upload-row" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Class</label>
          <select className="form-input" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Title</label>
          <input className="form-input" placeholder={scoreType === 'assignment' ? 'e.g. Homework 4' : 'e.g. Midterm Exam'}
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>
      </div>
      {classId && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Enter scores (out of 100)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 10 }}>
            {students.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{s.username}</div>
                </div>
                <input type="number" min="0" max="100" placeholder="—"
                  className="form-input" style={{ width: 70, textAlign: 'center' }}
                  value={scores[s.id] || ''}
                  onChange={e => setScores(prev => ({ ...prev, [s.id]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
      )}
      {msg && <div style={{ marginBottom: 12, fontSize: 13, color: msg.startsWith('✅') ? 'var(--safe)' : 'var(--danger)' }}>{msg}</div>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        <Upload size={14} /> {loading ? 'Uploading...' : `Upload ${label}`}
      </button>
    </div>
  );
}

export default function UploadDataPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('attendance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/classes'), API.get('/students')]).then(([cls, stu]) => {
      setClasses(cls.data);
      setStudents(stu.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Upload Data</h1>
        <p className="page-sub">Record attendance, assignments and exam results</p>
      </div>
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ key: 'attendance', label: '📅 Attendance' }, { key: 'assignment', label: '📝 Assignments' }, { key: 'exam', label: '📋 Exams' }].map(t => (
            <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>
      {tab === 'attendance' && <AttendanceUploader classes={classes} students={students} />}
      {tab === 'assignment' && <ScoreUploader classes={classes} students={students} scoreType="assignment" label="📝 Assignment Scores" />}
      {tab === 'exam' && <ScoreUploader classes={classes} students={students} scoreType="exam" label="📋 Exam Scores" />}
    </div>
  );
}