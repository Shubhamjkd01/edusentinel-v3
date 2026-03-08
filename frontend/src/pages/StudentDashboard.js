import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import StuHome from './stu/StuHome';
import StuActivities from './stu/StuActivities';
import StuLearning from './stu/StuLearning';
import StuAchievements from './stu/StuAchievements';

export default function StudentDashboard() {
  return (
    <Layout role="student">
      <Routes>
        <Route path="/"              element={<StuHome />} />
        <Route path="/activities"    element={<StuActivities />} />
        <Route path="/learning"      element={<StuLearning />} />
        <Route path="/achievements"  element={<StuAchievements />} />
      </Routes>
    </Layout>
  );
}
