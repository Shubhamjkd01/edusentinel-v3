import React from 'react';
import { Line } from 'react-chartjs-2';
import { StatCard, chartDefaults } from '../../components/utils';

const BADGES = [
  { em: '🏆', nm: 'Class Topper',  earned: false },
  { em: '🔥', nm: '7-Day Streak',  earned: true  },
  { em: '📚', nm: 'Bookworm',      earned: true  },
  { em: '💻', nm: 'Code Master',   earned: false },
  { em: '🎯', nm: 'Full Attend.',  earned: false },
  { em: '🤝', nm: 'Team Player',   earned: true  },
  { em: '🚀', nm: 'Fast Learner',  earned: true  },
  { em: '⭐', nm: 'Star Student',  earned: false },
  { em: '🎭', nm: 'Drama Star',    earned: false },
  { em: '🔬', nm: 'Lab Expert',    earned: true  },
  { em: '💡', nm: 'Innovator',     earned: true  },
  { em: '🏅', nm: '3 Clubs',       earned: true  },
  { em: '📊', nm: 'Data Wizard',   earned: false },
  { em: '🌟', nm: 'All-Rounder',   earned: false },
  { em: '🎓', nm: 'Honors',        earned: false },
  { em: '🤖', nm: 'Tech Guru',     earned: false },
  { em: '🔑', nm: '30 Days',       earned: false },
  { em: '🎪', nm: 'Multi-Talent',  earned: false },
  { em: '📈', nm: 'Improver',      earned: false },
  { em: '🎵', nm: 'Creative',      earned: false },
  { em: '👑', nm: 'Leader',        earned: false },
  { em: '🌈', nm: 'Diverse',       earned: false },
  { em: '💎', nm: 'Platinum',      earned: false },
  { em: '🦁', nm: 'Brave',         earned: false },
];

const GOALS = [
  { icon: '📅', goal: 'Reach 80% attendance in all subjects',  prog: 52, target: 80, color: 'var(--blue)' },
  { icon: '📚', goal: 'Complete 3 self-learning courses',       prog: 2,  target: 3,  color: 'var(--indigo)' },
  { icon: '🏆', goal: 'Join 3 extracurricular clubs',           prog: 3,  target: 3,  color: 'var(--green)' },
  { icon: '⭐', goal: 'Score 70%+ in all exams',               prog: 1,  target: 4,  color: 'var(--orange)' },
];

export default function StuAchievements() {
  const earned = BADGES.filter(b => b.earned).length;

  const xpData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'XP Earned',
      data: [120, 280, 340, 520, 780, 1240],
      borderColor: 'var(--yellow)',
      backgroundColor: 'rgba(217,119,6,0.08)',
      tension: 0.4, fill: true,
      pointBackgroundColor: 'var(--yellow)', pointRadius: 5, borderWidth: 2.5,
    }],
  };

  return (
    <div>
      <div className="topbar anim">
        <div><div className="pg-title">Achievements 🎖️</div><div className="pg-sub">Badges, milestones & goals</div></div>
      </div>

      <div className="stats-grid anim-d1">
        <StatCard color="yellow" icon="🎖️" value={earned}  label="Badges Earned" />
        <StatCard color="blue"   icon="🎯" value="3"       label="Goals Hit" />
        <StatCard color="indigo" icon="⭐" value="1,240"   label="Total XP" />
        <StatCard color="pink"   icon="🏅" value="Silver"  label="Current Tier" />
      </div>

      <div className="panel anim-d2">
        <div className="panel-header">
          <div className="panel-title">🏅 All Badges</div>
          <span className="badge badge-yellow">{earned} / {BADGES.length} earned</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
          {BADGES.map((b, i) => (
            <div key={i} className={`ach-card ${b.earned ? 'earned' : ''}`}>
              <div style={{ fontSize: 26, marginBottom: 5, opacity: b.earned ? 1 : 0.25 }}>{b.em}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: b.earned ? 'var(--text2)' : 'var(--muted)' }}>{b.nm}</div>
              <div style={{ fontSize: 9, marginTop: 3, color: b.earned ? 'var(--green)' : 'var(--muted)', fontWeight: 700 }}>
                {b.earned ? '✓ EARNED' : 'LOCKED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 anim-d3">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">📈 XP Progress</div></div>
          <div style={{ height: 180 }}>
            <Line data={xpData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 1500 } } }} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">🎯 Current Goals</div></div>
          {GOALS.map((g, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span>{g.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{g.goal}</span>
                <span style={{ fontFamily: 'Instrument Mono', fontSize: 11, fontWeight: 700, color: g.color }}>
                  {g.prog}/{g.target}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(g.prog / g.target) * 100}%`, background: g.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
              </div>
              {g.prog >= g.target && (
                <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginTop: 3 }}>✅ Goal Achieved!</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
