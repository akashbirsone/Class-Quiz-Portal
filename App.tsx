
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User } from './types';
import { Storage } from './storage';
import Navbar from './components/Navbar';
import AdminDashboard from './views/Admin/Dashboard';
import CreateQuiz from './views/Admin/CreateQuiz';
import QuizStats from './views/Admin/QuizStats';
import QuizzesPage from './views/Admin/Quizzes';
import AttemptsPage from './views/Admin/Attempts';
import AnalyticsPage from './views/Admin/Analytics';
import BlockedUsersPage from './views/Admin/BlockedUsers';
import StudentDirectoryPage from './views/Admin/StudentDirectory';
import ViolationLogsPage from './views/Admin/ViolationLogs';
import ReportsPage from './views/Admin/Reports';
import AcademicSessionManager from './views/Admin/AcademicSessionManager';
import StudentDashboard from './views/Student/Dashboard';
import TakeQuiz from './views/Student/TakeQuiz';
import QRScanner from './views/Student/QRScanner';
import Login from './views/Auth/Login';
import Landing from './views/Landing';
import Profile from './views/Profile';

const PrivateRoute = ({ children, role }: { children?: React.ReactNode; role?: 'admin' | 'student' }) => {
  const user = Storage.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(Storage.getCurrentUser());

  const handleLogin = (u: User) => {
    Storage.setCurrentUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    Storage.setCurrentUser(null);
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <main className={`flex-1 ${user ? 'pt-4 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full' : ''}`}>
          <Routes>
            <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/student" />) : <Landing />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/profile" element={<PrivateRoute role="student"><Profile /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/create" element={<PrivateRoute role="admin"><CreateQuiz /></PrivateRoute>} />
            <Route path="/admin/quiz/:id" element={<PrivateRoute role="admin"><QuizStats /></PrivateRoute>} />
            <Route path="/admin/quizzes" element={<PrivateRoute role="admin"><QuizzesPage /></PrivateRoute>} />
            <Route path="/admin/attempts" element={<PrivateRoute role="admin"><AttemptsPage /></PrivateRoute>} />
            <Route path="/admin/analytics" element={<PrivateRoute role="admin"><AnalyticsPage /></PrivateRoute>} />
            <Route path="/admin/blocked" element={<PrivateRoute role="admin"><BlockedUsersPage /></PrivateRoute>} />
            <Route path="/admin/students" element={<PrivateRoute role="admin"><StudentDirectoryPage /></PrivateRoute>} />
            <Route path="/admin/student/:id" element={<PrivateRoute role="admin"><Profile /></PrivateRoute>} />
            <Route path="/admin/violations" element={<PrivateRoute role="admin"><ViolationLogsPage /></PrivateRoute>} />
            <Route path="/admin/reports" element={<PrivateRoute role="admin"><ReportsPage /></PrivateRoute>} />
            <Route path="/admin/session" element={<PrivateRoute role="admin"><AcademicSessionManager /></PrivateRoute>} />

            {/* Student Routes */}
            <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/scan" element={<PrivateRoute role="student"><QRScanner /></PrivateRoute>} />
            <Route path="/quiz/:id" element={<PrivateRoute role="student"><TakeQuiz /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
