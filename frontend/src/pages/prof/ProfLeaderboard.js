import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../../api';
import { Spinner, chartDefaults } from '../../components/utils';

export default function ProfLeaderboard() {
  const [lb, setLb]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(r => setLb(r.data)).finally(() => setLoading(false));
  }, []);

  const byAcad = [...lb].sort((a, b) => b.academic_avg - a.academic_avg);
  const byXp   = [...lb].sort((a, b) => b.xp_points   - a.xp_points);

  const rankStyle = (i) => {
    if (i === 0) return 'lb-rank lb-rank-1';
    if (i === 1) return 'lb-rank lb-rank-2';
    if (i === 2) return 'lb-rank lb-rank-3';
    return 'lb-rank lb-rank-n';
  };

  const barData = {
    labels: lb.map(s => s.student_name.split(' ')[0]),
    datasets: [
      { label: 'Academic Score', data: lb.map(s => s.academic_avg),  backgroundColor: 'rgba(58,91,217,0.75)', borderRadius: 5 },
      { label: 'XP Points ÷ 10', data: lb.map(s => s.xp_points / 10), backgroundColor: 'rgba(108,63,216,0.65)', borderRadius: 5 },
    ],
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="topbar anim">
        <div>
          <div className="pg-title">Class Leaderboard</div>
          <div className="pg-sub">Academic & activity ranking</div>
        </div>
      </div>

      <div className="grid-2 anim-d1">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏆 Academic Rank</div>
            <span className="badge badge-blue">By Score Avg</span>
          </div>
          {byAcad.map((s, i) => (
            <div key={s.student_id} className="lb-item">
              <div className={rankStyle(i)}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.student_name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
              </div>
              <span style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: 'var(--blue)' }}>{s.academic_avg}%</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">⚡ Activity Rank</div>
            <span className="badge badge-orange">By XP</span>
          </div>
          {byXp.map((s, i) => (
            <div key={s.student_id} className="lb-item">
              <div className={rankStyle(i)}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.student_name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>@{s.username}</div>
              </div>
              <span style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: 'var(--indigo)' }}>⚡{s.xp_points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel anim-d2">
        <div className="panel-header"><div className="panel-title">📊 Score Distribution</div></div>
        <div style={{ height: 250 }}><Bar data={barData} options={chartDefaults} /></div>
      </div>
    </div>
  );
}
