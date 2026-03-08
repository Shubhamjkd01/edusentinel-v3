import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BookOpen, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import API from '../api';
import { RiskScore, RiskBar } from '../components/RiskMeter';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const chartOpts = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#7a8aa0' } },
    tooltip: { backgroundColor: '#111827', titleColor: '#e8edf5', bodyColor: '#7a8aa0', borderColor: '#1e2d45', borderWidth: 1 }
  },
  scales: {
    x: { ticks: { color: '#7a8aa0' }, grid: { color: '#1e2d45' } },
    y: { ticks: { color: '#7a8aa0' }, grid: { color: '#1e2d45' }, min: 0, max: 100 }
  }
};

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/dashboard').then(res => {
      setData(res.data);
      if (res.data.classes?.length > 0) setSelectedClass(res.data.classes[0].class_id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><p>No data available.</p></div>;

  const cls = data.classes?.find(c => c.class_id === selectedClass);

  const attendanceChartData = {
    labels: data.classes?.map(c => c.subject) || [],
    datasets: [{
      label: 'Attendance %',
      data: data.classes?.map(c => c.attendance_pct) || [],
      backgroundColor: data.classes?.map(c => c.attendance_pct < 75 ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)') || [],
      borderRadius: 6,
    }]
  };

  const scoreChartData = cls ? {
    labels: [...(cls.assignments?.map(a => a.title) || []), ...(cls.exams?.map(e => e.title) || [])],
    datasets: [{
      label: 'Score',
      data: [...(cls.assignments?.map(a => a.score) || []), ...(cls.exams?.map(e => e.score) || [])],
      borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4, fill: true, pointBackgroundColor: '#3b82f6', pointRadius: 5
    }]
  } : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Dashboard</h1>
        <p className="page-sub">Track your academic performance and risk indicators</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-accent-blue">
          <div className="card-title"><Activity size={12} style={{ display: 'inline' }} /> Overall Attendance</div>
          <div className="card-value" style={{ fontFamily: 'Space Mono', color: data.overall_attendance < 75 ? 'var(--danger)' : 'var(--safe)' }}>
            {data.overall_attendance}%
          </div>
          <div className="card-sub">{data.overall_attendance < 75 ? '⚠️ Below 75% threshold' : '✓ Safe range'}</div>
        </div>
        <div className="card stat-accent-purple">
          <div className="card-title"><BookOpen size={12} style={{ display: 'inline' }} /> Assignment Avg</div>
          <div className="card-value" style={{ fontFamily: 'Space Mono' }}>{data.overall_assignment_score}%</div>
          <div className="card-sub">Across all subjects</div>
        </div>
        <div className="card stat-accent-green">
          <div className="card-title"><TrendingUp size={12} style={{ display: 'inline' }} /> Exam Avg</div>
          <div className="card-value" style={{ fontFamily: 'Space Mono' }}>{data.overall_exam_score}%</div>
          <div className="card-sub">Across all subjects</div>
        </div>
        <div className="card stat-accent-red">
          <div className="card-title">Risk Level</div>
          <div className="card-value" style={{ fontSize: 18, color: data.overall_risk >= 70 ? 'var(--danger)' : data.overall_risk >= 40 ? 'var(--warning)' : 'var(--safe)' }}>
            {data.risk_level}
          </div>
          <div className="card-sub">{data.overall_risk}% overall risk</div>
        </div>
      </div>

      {data.overall_attendance < 75 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <span><strong>Attendance Warning:</strong> Your attendance ({data.overall_attendance}%) is below the 75% minimum. You may be barred from exams.</span>
        </div>
      )}
      {data.overall_risk >= 70 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <span><strong>High Risk:</strong> Please consult your professor immediately.</span>
        </div>
      )}
      {data.overall_risk >= 40 && data.overall_risk < 70 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <span><strong>Moderate Risk:</strong> Consider improving your attendance and scores.</span>
        </div>
      )}
      {data.overall_risk < 40 && (
        <div className="alert alert-safe" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} />
          <span><strong>You're on track!</strong> Keep up the good work.</span>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">My Risk Analysis</div>
        <RiskScore academic={data.academic_risk} engagement={data.engagement_risk} overall={data.overall_risk} />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">Attendance by Subject</div>
          <Bar data={attendanceChartData} options={chartOpts} height={120} />
          <div style={{ marginTop: 16 }}>
            {data.classes?.map(c => (
              <div key={c.class_id} style={{ marginBottom: 8 }}>
                <RiskBar value={c.attendance_pct} label={`${c.subject}: ${c.attendance_pct}%`} />
                {c.attendance_pct < 75 && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                    ⚠️ {(75 - c.attendance_pct).toFixed(1)}% below minimum
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Subject-wise Risk</div>
          {data.classes?.map(c => (
            <div key={c.class_id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</span>
                <span className="badge" style={{ background: c.risk_label === 1 ? 'var(--danger-bg)' : 'var(--safe-bg)', color: c.risk_label === 1 ? 'var(--danger)' : 'var(--safe)' }}>
                  {c.risk_level}
                </span>
              </div>
              <RiskBar value={c.overall_risk} label="Risk" />
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Assign: <span style={{ color: 'var(--text)' }}>{c.avg_assignment_score}%</span></span>
                <span>Exam: <span style={{ color: 'var(--text)' }}>{c.avg_exam_score}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Performance Detail</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.classes?.map(c => (
              <button key={c.class_id} className={`btn btn-sm ${selectedClass === c.class_id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedClass(c.class_id)}>
                {c.subject}
              </button>
            ))}
          </div>
        </div>
        {cls && scoreChartData && (
          <>
            <Line data={scoreChartData} options={chartOpts} height={80} />
            <div className="grid-2" style={{ marginTop: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>📝 ASSIGNMENTS</div>
                {cls.assignments?.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span>{a.title}</span>
                    <span style={{ fontWeight: 700, color: a.score >= 60 ? 'var(--safe)' : 'var(--danger)' }}>{a.score}/{a.max_score}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>📋 EXAMS</div>
                {cls.exams?.map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span>{e.title}</span>
                    <span style={{ fontWeight: 700, color: e.score >= 55 ? 'var(--safe)' : 'var(--danger)' }}>{e.score}/{e.max_score}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}