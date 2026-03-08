import React, { useEffect, useState } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, RadialLinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../../api';
import { StatCard, RiskBar, RiskPill, Spinner } from '../../components/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Tooltip, Legend, Filler);

export default function StuHome() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjIdx, setSubjIdx] = useState(0);
  const name = localStorage.getItem('edu_name') || 'Student';

  useEffect(() => {
    api.get('/student/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div style={{ padding: 40, color: 'var(--muted)' }}>No data found. Please ask your professor to upload attendance and scores.</div>;

  const { overall_risk, academic_risk, engagement_risk, risk_level,
          overall_attendance, overall_assignment_avg, overall_exam_avg,
          xp_points, classes } = data;

  // Risk gauge SVG
  const circ   = 2 * Math.PI * 45;
  const offset = circ * (1 - overall_risk / 100);
  const gColor = overall_risk >= 70 ? '#ef4444' : overall_risk >= 40 ? '#f59e0b' : '#10b981';

  // Score chart for selected subject
  const cls = classes[subjIdx] || classes[0] || {};
  const chartLabels  = [...(cls.assignments || []).map(a => a.title), ...(cls.exams || []).map(e => e.title)];
  const chartScores  = [...(cls.assignments || []).map(a => a.score), ...(cls.exams || []).map(e => e.score)];

  const scoreLineData = {
    labels: chartLabels,
    datasets: [{
      label: 'Score',
      data: chartScores,
      borderColor: 'var(--blue)',
      backgroundColor: 'rgba(58,91,217,0.08)',
      tension: 0.4, fill: true,
      pointBackgroundColor: 'var(--blue)', pointRadius: 5, pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5,
    }],
  };

  const radarData = {
    labels: classes.map(c => c.subject || c.class_name),
    datasets: [{
      label: 'Attendance %',
      data: classes.map(c => c.attendance_pct),
      backgroundColor: 'rgba(58,91,217,0.1)',
      borderColor: 'var(--blue)',
      pointBackgroundColor: 'var(--blue)', pointRadius: 4, borderWidth: 2,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', titleColor: '#0f1629', bodyColor: '#3d4a6b', borderColor: '#dde3f0', borderWidth: 1 } },
    scales: {
      x: { ticks: { color: '#7a88aa', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
      y: { ticks: { color: '#7a88aa' }, grid: { color: 'rgba(0,0,0,0.04)' }, min: 0, max: 100 },
    },
  };

  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', titleColor: '#0f1629', bodyColor: '#3d4a6b', borderColor: '#dde3f0', borderWidth: 1 } },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { color: '#7a88aa', font: { size: 9 }, stepSize: 25, backdropColor: 'transparent' },
        grid: { color: 'rgba(0,0,0,0.06)' },
        pointLabels: { color: '#3d4a6b', font: { size: 11 } },
        angleLines: { color: 'rgba(0,0,0,0.06)' },
      },
    },
  };

  return (
    <div>
      <div className="topbar anim">
        <div>
          <div className="pg-title">नमस्ते, {name.split(' ')[0]}! 👋</div>
          <div className="pg-sub">Your academic overview — today</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="anim-d1">
        {overall_attendance < 75 && (
          <div className="alert alert-red">
            <span>⚠️</span>
            <div><strong>Attendance Warning:</strong> Your attendance ({overall_attendance}%) is below the 75% minimum. Risk of exam disqualification.</div>
          </div>
        )}
        {overall_risk >= 70 ? (
          <div className="alert alert-red"><span>🚨</span><div><strong>High Academic Risk ({overall_risk}%):</strong> Please meet your professor immediately.</div></div>
        ) : overall_risk >= 40 ? (
          <div className="alert alert-yellow"><span>⚡</span><div><strong>Moderate Risk:</strong> Some indicators are below average. Take corrective action.</div></div>
        ) : (
          <div className="alert alert-green"><span>✅</span><div><strong>Great work!</strong> You're on track. Keep maintaining your excellent performance.</div></div>
        )}
      </div>

      {/* Risk Hero */}
      <div className="risk-hero anim-d2">
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -70, left: '20%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div className="risk-hero-grid">
          {/* Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="55" cy="55" r="45" fill="none" stroke={gColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Instrument Mono', lineHeight: 1 }}>{overall_risk}%</div>
                <div style={{ fontSize: 9, opacity: 0.65, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>OVERALL</div>
              </div>
            </div>
            <RiskPill value={overall_risk} level={risk_level} />
          </div>

          {/* Stats */}
          {[
            { label: 'Academic Risk',   value: academic_risk,    sub: 'Assignments & exams' },
            { label: 'Engagement Risk', value: engagement_risk,  sub: 'Attendance pattern' },
          ].map(m => (
            <div key={m.label} style={{ color: 'white' }}>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Instrument Mono', lineHeight: 1 }}>{m.value}%</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginTop: 7, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.value}%`, background: 'rgba(255,255,255,0.8)', borderRadius: 99, transition: 'width 1.2s ease' }} />
              </div>
              <div style={{ fontSize: 10, opacity: 0.55, marginTop: 3 }}>{m.sub}</div>
            </div>
          ))}

          <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Attendance',   value: `${overall_attendance}%` },
              { label: 'Assignments',  value: `${overall_assignment_avg}%` },
              { label: 'Exams',        value: `${overall_exam_avg}%` },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Instrument Mono' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid anim-d3">
        <StatCard color="blue"   icon="📅" value={`${overall_attendance}%`} label="Attendance"   sub={overall_attendance < 75 ? '⚠️ Below 75%' : '✓ Safe range'} />
        <StatCard color="indigo" icon="📝" value={`${overall_assignment_avg}%`} label="Assignments" sub="All subjects" />
        <StatCard color="green"  icon="📋" value={`${overall_exam_avg}%`}   label="Exam Avg"    sub="All subjects" />
        <StatCard color="orange" icon="⚡" value={xp_points}               label="XP Points"   sub="Activity score" />
      </div>

      {/* Score Chart + Radar */}
      <div className="grid-6-4 anim-d4">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📈 Score Timeline</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {classes.map((c, i) => (
                <div key={c.class_id}
                  style={{ padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '2px solid var(--border)', background: i === subjIdx ? 'var(--blue)' : 'var(--white)', color: i === subjIdx ? 'white' : 'var(--muted)', transition: 'all 0.15s' }}
                  onClick={() => setSubjIdx(i)}>
                  {c.subject}
                </div>
              ))}
            </div>
          </div>
          {chartLabels.length > 0
            ? <div style={{ height: 200 }}><Line data={scoreLineData} options={chartOpts} /></div>
            : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>No scores uploaded yet</div>
          }

          {/* Assignments / Exams mini table */}
          <div className="grid-2" style={{ marginTop: 16, marginBottom: 0 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9 }}>📝 Assignments</div>
              {(cls.assignments || []).map(a => (
                <div key={a.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12 }}>{a.title}</span>
                  <span style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: a.score >= 60 ? 'var(--green)' : 'var(--red)' }}>{a.score}/100</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9 }}>📋 Exams</div>
              {(cls.exams || []).map(e => (
                <div key={e.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12 }}>{e.title}</span>
                  <span style={{ fontFamily: 'Instrument Mono', fontWeight: 700, color: e.score >= 55 ? 'var(--green)' : 'var(--red)' }}>{e.score}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-header"><div className="panel-title">📅 Attendance Radar</div></div>
            <div style={{ height: 170 }}><Radar data={radarData} options={radarOpts} /></div>
          </div>

          <div className="panel">
            <div className="panel-header"><div className="panel-title">🎯 Subject Risk</div></div>
            {classes.map(c => (
              <div key={c.class_id} style={{ marginBottom: 11, paddingBottom: 11, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.subject}</span>
                  <RiskPill value={c.overall_risk} level={c.risk_level} />
                </div>
                <RiskBar value={c.attendance_pct} label="Attendance" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
