import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Users, AlertTriangle, TrendingUp, Upload, BookOpen } from 'lucide-react';
import API from '../api';
import { RiskBar, RiskBadge } from '../components/RiskMeter';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

export default function ProfessorDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/classes').then(res => {
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setClassData(null);
    API.get(`/get_student_data/${selectedClass}`).then(res => setClassData(res.data));
  }, [selectedClass]);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const atRisk = classData?.students?.filter(s => s.risk_label === 1) || [];
  const safe = classData?.students?.filter(s => s.risk_label === 0) || [];
  const avgAttendance = classData?.students?.length
    ? (classData.students.reduce((a, s) => a + s.attendance_pct, 0) / classData.students.length).toFixed(1) : 0;
  const avgRisk = classData?.students?.length
    ? (classData.students.reduce((a, s) => a + s.overall_risk, 0) / classData.students.length).toFixed(1) : 0;

  const barData = {
    labels: classData?.students?.map(s => s.full_name.split(' ')[0]) || [],
    datasets: [
      { label: 'Attendance %', data: classData?.students?.map(s => s.attendance_pct) || [], backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 },
      { label: 'Avg Assignment', data: classData?.students?.map(s => s.avg_assignment_score) || [], backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 4 },
      { label: 'Avg Exam', data: classData?.students?.map(s => s.avg_exam_score) || [], backgroundColor: 'rgba(6,182,212,0.7)', borderRadius: 4 },
    ]
  };

  const doughnutData = {
    labels: ['Safe', 'At Risk'],
    datasets: [{
      data: [safe.length, atRisk.length],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#10b981', '#ef4444'], borderWidth: 1
    }]
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Professor Dashboard</h1>
            <p className="page-sub">Monitor student performance and detect academic risk</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/professor/upload')}>
            <Upload size={15} /> Upload Data
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select Class:</span>
          {classes.map(cls => (
            <button key={cls.id}
              className={`btn btn-sm ${selectedClass === cls.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedClass(cls.id)}>
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {!classData && <div className="loading-wrap"><div className="spinner" /></div>}

      {classData && (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="card stat-accent-blue">
              <div className="card-title"><Users size={12} style={{ display: 'inline' }} /> Total Students</div>
              <div className="card-value">{classData.students.length}</div>
              <div className="card-sub">{classData.class_name}</div>
            </div>
            <div className="card stat-accent-red">
              <div className="card-title"><AlertTriangle size={12} style={{ display: 'inline' }} /> At Risk</div>
              <div className="card-value" style={{ color: 'var(--danger)' }}>{atRisk.length}</div>
              <div className="card-sub">{classData.students.length > 0 ? ((atRisk.length / classData.students.length) * 100).toFixed(0) : 0}% of class</div>
            </div>
            <div className="card stat-accent-green">
              <div className="card-title">Avg Attendance</div>
              <div className="card-value" style={{ color: avgAttendance >= 75 ? 'var(--safe)' : 'var(--warning)' }}>{avgAttendance}%</div>
              <div className="card-sub">Class average</div>
            </div>
            <div className="card stat-accent-yellow">
              <div className="card-title"><TrendingUp size={12} style={{ display: 'inline' }} /> Avg Risk</div>
              <div className="card-value" style={{ color: avgRisk >= 50 ? 'var(--danger)' : 'var(--warning)' }}>{avgRisk}%</div>
              <div className="card-sub">Overall class risk</div>
            </div>
          </div>

          <div className="grid-2-1" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="section-title"><TrendingUp size={16} /> Performance Overview</div>
              <Bar data={barData} options={chartOpts} height={100} />
            </div>
            <div className="card">
              <div className="section-title">Risk Distribution</div>
              <div style={{ maxWidth: 220, margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={{
                  plugins: {
                    legend: { labels: { color: '#7a8aa0' }, position: 'bottom' },
                    tooltip: { backgroundColor: '#111827', titleColor: '#e8edf5', bodyColor: '#7a8aa0' }
                  }
                }} />
              </div>
            </div>
          </div>

          {atRisk.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ color: 'var(--danger)' }}>
                <AlertTriangle size={16} /> Students Requiring Attention
              </div>
              {atRisk.map(s => (
                <div key={s.student_id} className="card card-sm" style={{ borderLeft: '3px solid var(--danger)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{s.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{s.username}</div>
                  </div>
                  <div style={{ minWidth: 180 }}><RiskBar value={s.overall_risk} label="Overall Risk" /></div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attendance: <span style={{ color: s.attendance_pct < 75 ? 'var(--danger)' : 'var(--text)' }}>{s.attendance_pct}%</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Exams: <span style={{ color: 'var(--text)' }}>{s.avg_exam_score}%</span></div>
                  </div>
                  <RiskBadge value={s.overall_risk} />
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div className="section-title"><BookOpen size={16} /> All Students</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Attendance</th><th>Assignments</th>
                    <th>Exams</th><th>Academic Risk</th><th>Engagement Risk</th>
                    <th>Overall Risk</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.students.sort((a, b) => b.overall_risk - a.overall_risk).map(s => (
                    <tr key={s.student_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>@{s.username}</div>
                      </td>
                      <td style={{ color: s.attendance_pct < 75 ? 'var(--danger)' : 'var(--safe)', fontWeight: 700 }}>{s.attendance_pct}%</td>
                      <td>{s.avg_assignment_score}%</td>
                      <td>{s.avg_exam_score}%</td>
                      <td><RiskBar value={s.academic_risk} /><span style={{ fontSize: 11 }}>{s.academic_risk}%</span></td>
                      <td><RiskBar value={s.engagement_risk} /><span style={{ fontSize: 11 }}>{s.engagement_risk}%</span></td>
                      <td><RiskBar value={s.overall_risk} /><span style={{ fontSize: 11 }}>{s.overall_risk}%</span></td>
                      <td><RiskBadge value={s.overall_risk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}