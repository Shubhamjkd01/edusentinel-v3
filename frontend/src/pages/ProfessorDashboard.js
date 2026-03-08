import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfHome from './prof/ProfHome';
import ProfUpload from './prof/ProfUpload';
import ProfActivities from './prof/ProfActivities';
import ProfLeaderboard from './prof/ProfLeaderboard';

export default function ProfessorDashboard() {
  return (
    <Layout role="professor">
      <Routes>
        <Route path="/"            element={<ProfHome />} />
        <Route path="/upload"      element={<ProfUpload />} />
        <Route path="/activities"  element={<ProfActivities />} />
        <Route path="/leaderboard" element={<ProfLeaderboard />} />
      </Routes>
    </Layout>
  );
}