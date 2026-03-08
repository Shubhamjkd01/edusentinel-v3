import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('edu_name') || 'User';

  const profLinks = [
    { path: '/professor',             label: 'Dashboard',   icon: '📊', group: 'Main' },
    { path: '/professor/upload',      label: 'Upload Data', icon: '📤' },
    { path: '/professor/activities',  label: 'Activities',  icon: '🏆', group: 'Analytics' },
    { path: '/professor/leaderboard', label: 'Leaderboard', icon: '🥇' },
  ];

  const stuLinks = [
    { path: '/student',              label: 'My Dashboard',  icon: '📊', group: 'My Space' },
    { path: '/student/activities',   label: 'My Activities', icon: '🏆' },
    { path: '/student/learning',     label: 'Self Learning', icon: '📚' },
    { path: '/student/achievements', label: 'Achievements',  icon: '🎖️' },
  ];

  const links = role === 'professor' ? profLinks : stuLinks;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/professor' || path === '/student') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sb-top">
          <div className="sb-logo">
            <div className="sb-icon">🛡️</div>
            <div>
              <div className="sb-name">EduSentinel</div>
              <div className="sb-tag">{role === 'professor' ? 'Professor' : 'Student'} Portal</div>
            </div>
          </div>
        </div>

        <nav className="sb-nav">
          {links.map((link) => (
            <React.Fragment key={link.path}>
              {link.group && <div className="nav-grp">{link.group}</div>}
              <div
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                <div className="nav-icon">{link.icon}</div>
                {link.label}
              </div>
            </React.Fragment>
          ))}
          <div className="nav-grp">System</div>
          <div className="nav-link" style={{ opacity: 0.4, cursor: 'default' }}>
            <div className="nav-icon">⚙️</div> Settings
          </div>
        </nav>

        <div className="sb-bot">
          <div className="user-row">
            <div className={`user-av ${role === 'professor' ? 'user-av-prof' : 'user-av-stu'}`}>
              {userName[0]}
            </div>
            <div>
              <div className="user-name">{userName}</div>
              <div className="user-role">{role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↩ Sign Out</button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}