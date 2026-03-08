import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function ProfHome() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(1);

  const CLASSES = [
    { id: 1, short: 'CS101' },
    { id: 2, short: 'MATH201' },
    { id: 3, short: 'PHY301' },
    { id: 4, short: 'ENG102' },
  ];

  useEffect(() => {
    setLoading(true);
    api.get(`/get_student_data/${activeClass}`)
      .then(res => setStudents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [activeClass]);

  const atRisk = students.filter(s => s.overall_risk >= 40);
  const safe = students.filter(s => s.overall_risk < 40);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="pg-title">Command Centre 📊</div>
          <div className="pg-sub">Real-time academic risk intelligence</div>
        </div>
      </div>

      <div className="class-tabs">
        {CLASSES.map(c => (
          <div key={c.id}
            className={`class-tab ${activeClass === c.id ? 'active' : ''}`}
            onClick={() => setActiveClass(c.id)}>
            {c.short}
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{atRisk.length}</div>
          <div className="stat-label">At Risk</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{safe.length}</div>
          <div className="stat-label">Safe Students</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-value">
            {students.length ? (students.reduce((a, s) => a + s.attendance_pct, 0) / students.length).toFixed(1) : 0}%
          </div>
          <div className="stat-label">Avg Attendance</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"><div className="spinner-circle"></div></div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">👥 All Students</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attendance</th>
                  <th>Assignments</th>
                  <th>Exams</th>
                  <th>XP</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.student_id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.student_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
                    </td>
                    <td style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: s.attendance_pct < 75 ? 'var(--red)' : 'var(--green)' }}>
                      {s.attendance_pct}%
                    </td>
                    <td style={{ fontFamily: 'Instrument Mono' }}>{s.avg_assignment_score}%</td>
                    <td style={{ fontFamily: 'Instrument Mono' }}>{s.avg_exam_score}%</td>
                    <td style={{ fontFamily: 'Instrument Mono', color: 'var(--indigo)', fontWeight: 700 }}>⚡{s.xp_points}</td>
                    <td>
                      <span className={`pill ${s.overall_risk >= 70 ? 'pill-high' : s.overall_risk >= 40 ? 'pill-mod' : 'pill-safe'}`}>
                        {s.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}