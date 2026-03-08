import React from 'react';

export function riskColor(v) {
  if (v >= 70) return 'var(--red)';
  if (v >= 40) return 'var(--yellow)';
  return 'var(--green)';
}

export function riskFillClass(v) {
  if (v >= 70) return 'fill-red';
  if (v >= 40) return 'fill-yellow';
  return 'fill-green';
}

export function RiskPill({ value, level }) {
  const lbl = level || (value >= 70 ? 'High Risk' : value >= 40 ? 'Moderate' : 'Safe');
  const cls = value >= 70 ? 'pill-high' : value >= 40 ? 'pill-mod' : 'pill-safe';
  return React.createElement('span', { className: `pill ${cls}` }, lbl);
}

export function RiskBar({ value, label }) {
  const fillCls = riskFillClass(value);
  return React.createElement('div', { className: 'risk-bar-wrap' },
    label && React.createElement('div', { className: 'risk-bar-row' },
      React.createElement('span', { className: 'risk-bar-label' }, label),
      React.createElement('span', { className: 'risk-bar-val', style: { color: riskColor(value) } }, `${value}%`)
    ),
    React.createElement('div', { className: 'risk-track' },
      React.createElement('div', { className: `risk-fill ${fillCls}`, style: { width: `${value}%` } })
    )
  );
}

export function StatCard({ color, icon, value, label, sub }) {
  return React.createElement('div', { className: `stat-card ${color}` },
    React.createElement('div', { className: 'stat-icon' }, icon),
    React.createElement('div', { className: 'stat-value' }, value),
    React.createElement('div', { className: 'stat-label' }, label),
    sub && React.createElement('div', { className: 'stat-sub' }, sub)
  );
}

export function Spinner() {
  return React.createElement('div', { className: 'spinner' },
    React.createElement('div', { className: 'spinner-circle' })
  );
}

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#7a88aa', font: { size: 11, family: 'Plus Jakarta Sans' } },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#0f1629',
      bodyColor: '#3d4a6b',
      borderColor: '#dde3f0',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: { ticks: { color: '#7a88aa', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
    y: { ticks: { color: '#7a88aa' }, grid: { color: 'rgba(0,0,0,0.04)' }, min: 0, max: 100 },
  },
};

export const donutDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      labels: { color: '#3d4a6b', font: { size: 11 } },
      position: 'bottom',
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#0f1629',
      bodyColor: '#3d4a6b',
      borderColor: '#dde3f0',
      borderWidth: 1,
    },
  },
};