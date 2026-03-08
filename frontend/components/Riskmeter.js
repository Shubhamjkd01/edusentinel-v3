import React from 'react';

export function RiskBar({ value, label }) {
  const cls = value >= 70 ? 'risk-high' : value >= 40 ? 'risk-med' : 'risk-low';
  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ color, fontFamily: 'Space Mono', fontWeight: 700 }}>{value}%</span>
        </div>
      )}
      <div className="risk-bar-wrap">
        <div className={`risk-bar-fill ${cls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function RiskBadge({ value }) {
  const isHigh = value >= 70;
  const isMed = value >= 40;
  const badgeCls = isHigh ? 'badge-danger' : isMed ? 'badge-warning' : 'badge-safe';
  const display = isHigh ? 'High Risk' : isMed ? 'Moderate' : 'Safe';
  return <span className={`badge ${badgeCls}`}>{display}</span>;
}

export function RiskScore({ academic, engagement, overall }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {[
        { label: 'Academic Risk', value: academic },
        { label: 'Engagement Risk', value: engagement },
        { label: 'Overall Risk', value: overall },
      ].map(item => (
        <div key={item.label} style={{ background: 'var(--bg-card-2)', borderRadius: 10, padding: '12px 20px', flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono',
            color: item.value >= 70 ? 'var(--danger)' : item.value >= 40 ? 'var(--warning)' : 'var(--safe)' }}>
            {item.value}%
          </div>
        </div>
      ))}
    </div>
  );
}