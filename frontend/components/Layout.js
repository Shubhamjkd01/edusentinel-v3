import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, LogOut, GraduationCap, BookOpen, ShieldAlert } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const fullName = localStorage.getItem('fullName');

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isProfessor = role === 'professor';

  const navItems = isProfessor ? [
    { path: '/professor', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { path: '/professor/upload', label: 'Upload Data', icon: <Upload size={16} /> },
  ] : [
    { path: '/student', label: 'My Dashboard', icon: <LayoutDashboard size={16} /> },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">Edu<span className="logo-dot">Sentinel</span></div>
          <div className="logo-sub">{isProfessor ? 'Professor Portal' : 'Student Portal'}</div>
        </div>
        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <div key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}>
            {item.icon}{item.label}
          </div>
        ))}
        <div className="nav-section" style={{ marginTop: 16 }}>Info</div>
        <div className="nav-item" style={{ cursor: 'default' }}>
          {isProfessor ? <BookOpen size={16} /> : <GraduationCap size={16} />}
          {isProfessor ? 'Professor' : 'Student'}
        </div>
        <div className="nav-item" style={{ cursor: 'default' }}>
          <ShieldAlert size={16} />Risk Monitor
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <strong>{fullName || 'User'}</strong>{role}
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={14} style={{ display: 'inline', marginRight: 6 }} />Logout
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}