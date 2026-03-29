
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, BarChart3, QrCode, LogOut, User as UserIcon, 
  Menu, X, BookOpen, Database, Monitor, Users, Activity, FileText, 
  AlertTriangle, ShieldAlert, AlertCircle, UserX, TrendingUp, PieChart, 
  ShieldCheck, Settings, UserCheck, Lock, ChevronDown, ChevronUp, Download,
  Trophy, History, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Storage } from '../storage';
import DatabaseStatus from './DatabaseStatus';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    blockedCount: 0,
    warningCount: 0,
    liveViolations: 0
  });

  const isAdmin = user.role === 'admin';

  const [quizzesCount, setQuizzesCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (isAdmin) {
        const users = await Storage.getUsers();
        const violations = await Storage.getViolations();
        const quizzes = await Storage.getQuizzes();
        const attempts = await Storage.getAttempts();
        
        const blocked = users.filter(u => u.isBlocked).length;
        const totalWarnings = violations.length;
        
        // "Live" violations - last 30 minutes
        const thirtyMinsAgo = Date.now() - (30 * 60 * 1000);
        const live = violations.filter(v => v.timestamp > thirtyMinsAgo).length;

        setStats({
          blockedCount: blocked,
          warningCount: totalWarnings,
          liveViolations: live
        });
        setQuizzesCount(quizzes.length);
        setAttemptsCount(attempts.length);
      }
    };
    loadData();
  }, [isAdmin, isSidebarOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const adminSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin',
      priority: true
    },
    {
      id: 'exam-mgmt',
      title: 'Exam Management',
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { label: 'Create Exam', path: '/admin/create', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'Manage Exams', path: '/admin/quizzes', icon: <Database className="w-4 h-4" /> },
        { label: 'Question Bank', path: '/admin/quizzes', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      id: 'monitoring',
      title: 'Student Monitoring',
      icon: <Monitor className="w-5 h-5" />,
      priority: true,
      badge: stats.liveViolations > 0 ? stats.liveViolations : undefined,
      items: [
        { label: 'Student Directory', path: '/admin/students', icon: <Users className="w-4 h-4" /> },
        { label: 'Live Proctoring', path: '/admin/attempts', icon: <Activity className="w-4 h-4" /> },
        { label: 'Activity Logs', path: '/admin/attempts', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      id: 'warnings',
      title: 'Warnings & Violations',
      icon: <AlertTriangle className="w-5 h-5" />,
      priority: true,
      badge: stats.warningCount > 0 ? stats.warningCount : undefined,
      items: [
        { label: 'Warning Records', path: '/admin/violations', icon: <ShieldAlert className="w-4 h-4" /> },
        { label: 'Violation Types', path: '/admin/violations', icon: <AlertCircle className="w-4 h-4" /> },
      ]
    },
    {
      id: 'blocked',
      title: 'Blocked Students',
      icon: <UserX className="w-5 h-5" />,
      priority: true,
      badge: stats.blockedCount > 0 ? stats.blockedCount : undefined,
      path: '/admin/blocked'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      items: [
        { label: 'Performance', path: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Exam Reports', path: '/admin/analytics', icon: <PieChart className="w-4 h-4" /> },
        { label: 'Proctoring Insights', path: '/admin/analytics', icon: <ShieldCheck className="w-4 h-4" /> },
      ]
    },
    {
      id: 'download-reports',
      title: 'Download Reports',
      icon: <Download className="w-5 h-5" />,
      path: '/admin/reports',
      priority: true
    },
    {
      id: 'session-mgmt',
      title: 'Academic Session',
      icon: <RotateCcw className="w-5 h-5" />,
      path: '/admin/session',
      priority: true
    },
    {
      id: 'controls',
      title: 'Admin Controls',
      icon: <Settings className="w-5 h-5" />,
      items: [
        { label: 'Unblock Student', path: '/admin/blocked', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Permissions', path: '/admin', icon: <Lock className="w-4 h-4" /> },
        { label: 'System Settings', path: '/admin', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const studentItems = [
    { label: 'Home', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Active Exams', path: '/student?tab=exams', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Leaderboard', path: '/student?tab=leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { label: 'History', path: '/student?tab=history', icon: <History className="w-5 h-5" /> },
    { label: 'Violations', path: '/student?tab=violations', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Scan', path: '/student/scan', icon: <QrCode className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">ClassQuiz</span>
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:block">
                <DatabaseStatus />
              </div>
              
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {user.role} {user.academicYear && `• ${user.academicYear}`}
                </p>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2"></div>

              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-600 p-1.5 rounded-lg shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-lg font-black text-slate-900">ClassQuiz</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                {isAdmin && (
                  <div className="mb-6 grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exams</p>
                      <p className="text-sm font-black text-indigo-600">{quizzesCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                      <p className="text-sm font-black text-emerald-600">{attemptsCount}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blocked</p>
                      <p className="text-sm font-black text-red-600">{stats.blockedCount}</p>
                    </div>
                  </div>
                )}
                {isAdmin ? (
                  adminSections.map((section) => {
                    const hasItems = section.items && section.items.length > 0;
                    const isExpanded = expandedSections[section.id];
                    const isActive = section.path && location.pathname === section.path;

                    return (
                      <div key={section.id} className="space-y-1">
                        {hasItems ? (
                          <>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                isExpanded ? 'bg-slate-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`${isExpanded ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                  {section.icon}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-tight">{section.title}</span>
                                {section.badge !== undefined && (
                                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {section.badge}
                                  </span>
                                )}
                              </div>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden pl-10 space-y-1"
                                >
                                  {section.items?.map((item) => (
                                    <Link
                                      key={item.label}
                                      to={item.path}
                                      onClick={toggleSidebar}
                                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        location.pathname === item.path 
                                          ? 'text-indigo-600 bg-indigo-50/50' 
                                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      {item.icon}
                                      <span>{item.label}</span>
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            to={section.path || '#'}
                            onClick={toggleSidebar}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                              isActive ? 'bg-indigo-50 text-indigo-600 font-black' : 'text-slate-500 hover:bg-slate-50 font-bold'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {section.icon}
                              </div>
                              <span className="text-sm uppercase tracking-tight">{section.title}</span>
                              {section.badge !== undefined && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {section.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })
                ) : (
                  studentItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={toggleSidebar}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-600 font-black' 
                            : 'text-slate-500 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        <div className={`${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {item.icon}
                        </div>
                        <span className="text-sm uppercase tracking-tight">{item.label}</span>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="mb-6 flex justify-center">
                  <DatabaseStatus />
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Ready to Leave?</h3>
              <p className="text-slate-500 font-medium text-sm mb-8">
                Are you sure you want to sign out of your account?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={cancelLogout}
                  className="py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  No
                </button>
                <button
                  onClick={confirmLogout}
                  className="py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );
};

export default Navbar;
