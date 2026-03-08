import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../../api';
import { StatCard, Spinner, chartDefaults } from '../../components/utils';

const COURSE_META = {
  'Python for Data Science':      { icon: '🐍', color: '#3a5bd9', bg: '#eef1fd' },
  'Machine Learning Basics':      { icon: '🤖', color: '#6c3fd8', bg: '#f0ebff' },
  'Web Development Bootcamp':     { icon: '🌐', color: '#059669', bg: '#ecfdf5' },
  'Digital Marketing':            { icon: '📱', color: '#d97706', bg: '#fffbeb' },
  'Public Speaking Masterclass':  { icon: '🎙️', color: '#be185d', bg: '#fdf2f8' },
  'Discrete Mathematics':         { icon: '🔢', color: '#e85d04', bg: '#fff4ed' },
  'Data Structures & Algorithms': { icon: '📊', color: '#0891b2', bg: '#ecfeff' },
  'English Communication':        { icon: '📝', color: '#7c3aed', bg: '#f5f3ff' },
  'Financial Literacy':           { icon: '💰', color: '#059669', bg: '#ecfdf5' },
  'Photography Basics':           { icon: '📷', color: '#d97706', bg: '#fffbeb' },
};

const SKILLS = [
  { name: 'Programming',    level: 68, color: '#3a5bd9' },
  { name: 'Data Analysis',  level: 45, color: '#6c3fd8' },
  { name: 'Communication',  level: 82, color: '#be185d' },
  { name: 'Problem Solving',level: 74, color: '#059669' },
  { name: 'Web Dev',        level: 55, color: '#e85d04' },
  { name: 'Leadership',     level: 38, color: '#d97706' },
];

export default function StuLearning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learning/courses').then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  const completed = courses.filter(c => c.completed).length;
  const active    = courses.filter(c => !c.completed).length;

  const studyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [1.5, 2, 1, 3, 2.5, 4, 2],
      borderColor: 'var(--blue)',
      backgroundColor: 'rgba(58,91,217,0.08)',
      tension: 0.4, fill: true,
      pointBackgroundColor: 'var(--blue)', pointRadius: 5, borderWidth: 2.5,
    }],
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="topbar anim">
        <div><div className="pg-title">Self Learning 📚</div><div className="pg-sub">Extra learning beyond curriculum</div></div>
        <button className="btn btn-primary btn-sm">+ Log Course</button>
      </div>

      <div className="stats-grid anim-d1">
        <StatCard color="blue"   icon="📖" value={courses.length} label="Total Courses" />
        <StatCard color="green"  icon="✅" value={completed}      label="Completed" />
        <StatCard color="teal"   icon="🔥" value="14"            label="Day Streak" />
        <StatCard color="yellow" icon="⭐" value="4.8"           label="Avg Rating" />
      </div>

      <div className="grid-2 anim-d2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📚 My Courses</div>
            <span className="badge badge-blue">{active} Active</span>
          </div>
          {courses.length === 0
            ? <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No courses yet. Ask your professor or add a course.</div>
            : courses.map(c => {
                const meta = COURSE_META[c.title] || { icon: '📖', color: '#3a5bd9', bg: '#eef1fd' };
                return (
                  <div key={c.id} className="learn-card">
                    <div className="learn-icon" style={{ background: meta.bg }}>{meta.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{c.platform} · ⭐ {c.rating}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.progress_pct}%`, background: meta.color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontFamily: 'Instrument Mono', fontSize: 11, fontWeight: 700, color: meta.color }}>{c.progress_pct}%</span>
                      </div>
                    </div>
                    <span className={`badge ${c.completed ? 'badge-green' : 'badge-blue'}`}>{c.completed ? 'Done' : 'Active'}</span>
                  </div>
                );
              })
          }
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">🎯 Skills Developed</div></div>
          {SKILLS.map(s => (
            <div key={s.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{s.name}</span>
                <span style={{ fontFamily: 'Instrument Mono', fontSize: 12, fontWeight: 700, color: s.color }}>{s.level}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.level}%`, background: s.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel anim-d3">
        <div className="panel-header"><div className="panel-title">📊 Weekly Study Hours</div></div>
        <div style={{ height: 180 }}>
          <Line data={studyData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 5 } } }} />
        </div>
      </div>
    </div>
  );
}
