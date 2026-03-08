import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('edu_token');
  const userRole = localStorage.getItem('edu_role');
  if (!token) return <Navigate to="/" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/professor/*" element={
          <PrivateRoute role="professor"><ProfessorDashboard /></PrivateRoute>
        } />
        <Route path="/student/*" element={
          <PrivateRoute role="student"><StudentDashboard /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
