import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import api from '../../api';
import { StatCard, Spinner, donutDefaults } from '../../components/utils';

export default function ProfActivities() {
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/activities'),
      api.get('/leaderboard'),
    ]).then(([aRes, lRes]) => {
      setActivities(aRes.data);
      setLeaderboard(lRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const EC_META = {
    'Coding Club':       { color: '#3a5bd9', bg: '#eef1fd' },
    'Debate Society':    { color: '#be185d', bg: '#fdf2f8' },
    'Robotics Team':     { color: '#6c3fd8', bg: '#f0ebff' },
    'Drama Club':        { color: '#e85d04', bg: '#fff4ed' },
    'Math Olympiad':     { color: '#059669', bg: '#ecfdf5' },
    'Photography Club':  { color: '#d97706', bg: '#fffbeb' },
  };

  const donutData = {
    labels: activities.map(a => a.name),
    datasets: [{
      data: activities.map(a => a.participant_count),
      backgroundColor: activities.map(a => (EC_META[a.name]?.color || '#3a5bd9') + 'cc'),
      borderColor: activities.map(a => EC_META[a.name]?.color || '#3a5bd9'),
      borderWidth: 2,
    }],
  };

  const rankStyle = (i) => {
    if (i === 0) return 'lb-rank lb-rank-1';
    if (i === 1) return 'lb-rank lb-rank-2';
    if (i === 2) return 'lb-rank lb-rank-3';
    return 'lb-rank lb-rank-n';
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="topbar anim">
        <div>
          <div className="pg-title">Extracurricular Activities</div>
          <div className="pg-sub">Student engagement beyond academics</div>
        </div>
        <button className="btn btn-primary btn-sm">+ Add Activity</button>
      </div>

      <div className="stats-grid anim-d1">
        <StatCard color="blue"   icon="🏆" value={activities.reduce((a, c) => a + c.participant_count, 0)} label="Total Participants" />
        <StatCard color="green"  icon="🎭" value={activities.length} label="Active Clubs" />
        <StatCard color="orange" icon="🏅" value="23" label="Awards Given" />
        <StatCard color="indigo" icon="⏱️" value="312h" label="Total Hours" />
      </div>

      <div className="grid-2 anim-d2">
        {/* Activity Cards */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏆 All Activities</div>
            <span className="badge badge-blue">{activities.length} active</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {activities.map(a => {
              const meta = EC_META[a.name] || { color: '#3a5bd9', bg: '#eef1fd' };
              const pct  = ((a.participant_count / a.max_participants) * 100).toFixed(0);
              return (
                <div key={a.id} style={{ background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 12, padding: 14, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 9 }}>{a.icon}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: meta.bg, color: meta.color, fontWeight: 700 }}>{a.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 9 }}>{a.description}</div>
                  <div style={{ height: 5, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 99 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                    <span style={{ color: 'var(--muted)' }}>{a.participant_count}/{a.max_participants} members</span>
                    <span style={{ fontWeight: 700, color: meta.color }}>{a.hours_per_week}h/wk</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Participation Chart */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">📊 Participation by Club</div></div>
          <div style={{ height: 220 }}><Doughnut data={donutData} options={{ ...donutDefaults, plugins: { ...donutDefaults.plugins, legend: { labels: { color: '#3d4a6b', font: { size: 11 } }, position: 'right' } } }} /></div>
        </div>
      </div>

      {/* XP Leaderboard */}
      <div className="panel anim-d3">
        <div className="panel-header">
          <div className="panel-title">🥇 Top Performers — XP Leaderboard</div>
          <span className="badge badge-yellow">By XP Points</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {leaderboard.slice(0, 10).map((s, i) => (
            <div key={s.student_id} className="lb-item">
              <div className={rankStyle(i)}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.student_name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
              </div>
              <span style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: 'var(--indigo)' }}>⚡{s.xp_points} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
