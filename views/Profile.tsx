
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Mail, GraduationCap, BookOpen, Hash, 
  ArrowLeft, ShieldAlert, CheckCircle2, History, AlertTriangle,
  Download, Eye, Clock, TrendingUp, Award, Calendar
} from 'lucide-react';
import { User, Attempt, Quiz, Violation } from '../types';
import { Storage } from '../storage';
import { ReportService } from '../services/reportService';
import AttemptReview from '../components/AttemptReview';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = Storage.getCurrentUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number | string>('N/A');
  const [percentile, setPercentile] = useState<number | string>('N/A');

  // Modal states
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const targetId = id || currentUser?.id;
      
      if (!targetId) {
        navigate('/login');
        return;
      }

      const allUsers = await Storage.getUsers();
      const user = allUsers.find(u => u.id === targetId);
      
      if (user) {
        setProfileUser(user);
        
        // Load student specific data if the profile is for a student
        if (user.role === 'student') {
          const allAttempts = await Storage.getAttempts();
          const userAttempts = allAttempts.filter(a => a.studentId === targetId);
          setAttempts(userAttempts);
          
          const allQuizzes = await Storage.getQuizzes();
          setQuizzes(allQuizzes);
          
          const allViolations = await Storage.getViolations();
          setViolations(allViolations.filter(v => v.studentId === targetId));

          // Calculate Rank
          const classStudents = allUsers.filter(u => 
            u.role === 'student' && 
            u.academicYear === user.academicYear && 
            u.semester === user.semester
          );

          const leaderboard = classStudents.map(u => {
            const uAttempts = allAttempts.filter(a => a.studentId === u.id);
            const avg = uAttempts.length > 0 
              ? uAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0) / uAttempts.length * 100
              : 0;
            return { id: u.id, avg };
          }).sort((a, b) => b.avg - a.avg);

          const currentRank = leaderboard.findIndex(s => s.id === targetId) + 1;
          setRank(currentRank > 0 ? currentRank : 'N/A');
          
          if (leaderboard.length > 1) {
            const perc = Math.round(((leaderboard.length - currentRank) / (leaderboard.length - 1)) * 100);
            setPercentile(perc);
          } else {
            setPercentile(100);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [id, currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="p-20 text-center glass-card border-red-100 m-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900">User Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold mt-4 inline-block">Go Back</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isAdminViewing = currentUser?.role === 'admin' && !isOwnProfile;

  const stats = {
    avgScore: attempts.length > 0 
      ? (attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length * 100).toFixed(1)
      : '0',
    totalExams: attempts.length,
    violationsCount: violations.length,
    rank: rank
  };

  const openAttemptReview = (attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setSelectedAttempt(attempt);
    }
  };

  const handleDownloadReport = (attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz && profileUser) {
      ReportService.generateStudentReport(profileUser, quiz, attempt);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Attempt Review Modal */}
      <AnimatePresence>
        {selectedAttempt && selectedQuiz && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Submission Review</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                    {profileUser.name} • {selectedQuiz.title}
                  </p>
                </div>
                <button 
                  onClick={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <AttemptReview quiz={selectedQuiz} attempt={selectedAttempt} />
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {isOwnProfile ? 'My Profile' : 'Student Profile'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isOwnProfile ? 'Manage your personal details and academic history.' : `Viewing academic profile for ${profileUser.name}.`}
            </p>
          </div>
        </div>
        
        {isAdminViewing && (
          <div className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center space-x-3 ${profileUser.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${profileUser.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span>{profileUser.isBlocked ? 'Account Restricted' : 'Active Status'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card shadow-2xl border-white/60 overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-violet-700 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <UserIcon className="w-12 h-12" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{profileUser.name}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{profileUser.role}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-slate-700">{profileUser.email}</p>
                  </div>
                </div>

                {profileUser.role === 'student' && (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                        <p className="text-sm font-bold text-slate-700">{profileUser.rollNumber || 'Not Assigned'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</p>
                          <p className="text-sm font-bold text-slate-700">{profileUser.academicYear || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</p>
                          <p className="text-sm font-bold text-slate-700">{profileUser.semester || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {profileUser.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 border-white/60 shadow-xl text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Score</p>
                <p className="text-2xl font-black text-indigo-600">{stats.avgScore}%</p>
              </div>
              <div className="glass-card p-6 border-white/60 shadow-xl text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessments</p>
                <p className="text-2xl font-black text-slate-900">{stats.totalExams}</p>
              </div>
            </div>
          )}
        </div>

        {/* Activity & History */}
        <div className="lg:col-span-2 space-y-8">
          {profileUser.role === 'student' ? (
            <>
              {/* Performance Chart / Stats */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 border-white/60 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    <span>Academic Performance</span>
                  </h3>
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{percentile > 0 ? `Top ${100-percentile}%` : 'Rank Pending'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                        <History className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submissions</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{attempts.length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total exams taken</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-red-600">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Violations</span>
                    </div>
                    <p className="text-3xl font-black text-red-600">{violations.length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Proctoring alerts</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consistency</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">#{rank}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Current Class Rank</p>
                  </div>
                </div>
              </motion.div>

              {/* Submission History */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card border-white/60 shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <span>Exam History</span>
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                    {attempts.length} Records
                  </span>
                </div>

                <div className="divide-y divide-slate-50">
                  {attempts.length === 0 ? (
                    <div className="p-20 text-center opacity-40">
                      <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="font-black text-xs uppercase tracking-widest">No Exam History Available</p>
                    </div>
                  ) : (
                    attempts.sort((a, b) => b.timestamp - a.timestamp).map(attempt => {
                      const quiz = quizzes.find(q => q.id === attempt.quizId);
                      const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                      return (
                        <div key={attempt.id} className="p-8 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center space-x-6">
                            <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-inner ${
                              scorePercent >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                              scorePercent >= 50 ? 'bg-indigo-50 text-indigo-600' : 
                              'bg-amber-50 text-amber-600'
                            }`}>
                              <span className="text-xl font-black leading-none">{scorePercent}%</span>
                              <span className="text-[8px] font-black uppercase tracking-widest mt-1">Score</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{quiz?.title || 'Unknown Exam'}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(attempt.timestamp).toLocaleDateString()}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {attempt.score}/{attempt.totalQuestions} Correct
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleDownloadReport(attempt)}
                              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all shadow-sm"
                              title="Download Report"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openAttemptReview(attempt)}
                              className="px-6 py-3 bg-white border border-slate-200 text-slate-900 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="glass-card p-12 text-center border-white/60 shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
              <p className="text-slate-500 font-medium mt-2">Only student profiles can be viewed in this section.</p>
              <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold mt-4 inline-block">Go Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default Profile;
