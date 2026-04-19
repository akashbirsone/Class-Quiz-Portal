
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  History, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Eye,
  X,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import AttemptReview from '../../components/AttemptReview';
import { Quiz, Attempt, User, LeaderboardEntry, Violation } from '../../types';
import { Storage } from '../../storage';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'exams' | 'history' | 'leaderboard' | 'violations'>('exams');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'exams' || tab === 'history' || tab === 'leaderboard' || tab === 'violations') {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rank, setRank] = useState<number | string>('N/A');
  const [percentile, setPercentile] = useState<number>(0);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [historyYearFilter, setHistoryYearFilter] = useState<string>('All Years');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const currentUser = Storage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const allQuizzesData = await Storage.getQuizzes();
        setAllQuizzes(allQuizzesData);
        const activeQuizzes = allQuizzesData.filter(q => 
          q.academicYear === currentUser.academicYear && 
          q.semester === currentUser.semester &&
          q.active &&
          q.status === 'published'
        );
        const allAttemptsData = await Storage.getAttempts();
        const allAttempts = allAttemptsData.filter(a => a.studentId === currentUser.id);
        setQuizzes(activeQuizzes);
        setAttempts(allAttempts);

        const allViolationsData = await Storage.getViolations();
        const userViolations = allViolationsData.filter(v => v.studentId === currentUser.id);
        setViolations(userViolations);

        // Generate mock leaderboard
        const usersData = await Storage.getUsers();
        const users = usersData.filter(u => 
          u.role === 'student' && 
          u.academicYear === currentUser.academicYear &&
          u.semester === currentUser.semester
        );
        const allUserAttempts = allAttemptsData;
        const entries: LeaderboardEntry[] = users.map(u => {
          const uAttempts = allUserAttempts.filter(a => a.studentId === u.id);
          const avgScore = uAttempts.length > 0 
            ? uAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0) / uAttempts.length * 100
            : 0;
          return {
            studentName: u.name,
            studentEmail: u.email,
            academicYear: u.academicYear || '',
            semester: u.semester || '',
            score: Math.round(avgScore),
            totalQuizzes: uAttempts.length
          };
        }).sort((a, b) => b.score - a.score);
        setLeaderboard(entries);

        const currentRank = entries.findIndex(e => e.studentEmail === currentUser.email) + 1;
        
        if (allAttempts.length === 0) {
          setRank(0);
          setPercentile(0);
        } else {
          setRank(currentRank > 0 ? currentRank : 'N/A');
          
          if (entries.length > 1 && currentRank > 0) {
            const perc = Math.round(((entries.length - currentRank) / (entries.length - 1)) * 100);
            setPercentile(perc);
          } else if (entries.length === 1 && currentRank === 1) {
            setPercentile(100);
          }
        }
      }
    };
    fetchDashboardData();
  }, []);

  const getAttemptForQuiz = (quizId: string) => attempts.find(a => a.quizId === quizId);

  const openReview = async (attempt: Attempt) => {
    const quiz = allQuizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setSelectedAttempt(attempt);
    }
  };

  const stats = {
    completed: attempts.length,
    pending: quizzes.filter(q => !getAttemptForQuiz(q.id)).length,
    avgScore: attempts.length > 0 
      ? (attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length * 100).toFixed(0)
      : 0,
    rank: rank,
    percentile: percentile
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Attempt Review Modal */}
      <AnimatePresence>
        {selectedAttempt && selectedQuiz && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">Examination History</h3>
                  <p className="text-slate-500 font-bold text-[9px] md:text-sm uppercase tracking-widest mt-1">
                    {selectedQuiz.title} • {new Date(selectedAttempt.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
                <AttemptReview quiz={selectedQuiz} attempt={selectedAttempt} />
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <p className="text-xs text-slate-500 font-medium">Session {user?.academicYear} • {user?.name}</p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link to="/profile" className="text-xs text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-widest">Profile</Link>
          </div>
        </div>
        <button
          onClick={() => navigate('/student/scan')}
          className="w-full md:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          <QrCode className="w-6 h-6" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Exams Taken', value: `${stats.completed}`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'indigo' },
          { label: 'Current Rank', value: stats.rank === 'N/A' ? 'Pending' : `#${stats.rank}`, icon: <Trophy className="w-5 h-5" />, color: 'blue' },
          { label: 'Performance', value: stats.completed > 0 ? `Top ${100 - stats.percentile}%` : 'No Data', icon: <ArrowRight className="w-5 h-5" />, color: 'emerald' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 md:p-6 shadow-sm border-white/50 flex items-center space-x-4 md:space-x-5">
            <div className={`p-3 md:p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-4 md:w-5 h-4 md:h-5' })}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-[18px] max-w-full overflow-x-auto no-scrollbar relative">
        <motion.div
          className="absolute top-1 bottom-1 bg-white rounded-[14px] shadow-sm z-0"
          initial={false}
          animate={{
            left: activeTab === 'exams' ? '4px' : activeTab === 'leaderboard' ? '25%' : activeTab === 'history' ? '50%' : '75%',
            width: '24.5%'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 min-w-[70px] py-3 rounded-[14px] text-[9px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'exams' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Exams
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 min-w-[70px] py-3 rounded-[14px] text-[9px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'leaderboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          Rank
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[70px] py-3 rounded-[14px] text-[9px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`flex-1 min-w-[70px] py-3 rounded-[14px] text-[9px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'violations' ? 'text-red-600' : 'text-slate-400'}`}
        >
          Alerts
        </button>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'exams' && (
          <motion.div
            key="exams-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quizzes.length === 0 ? (
              <div className="col-span-full py-20 glass-card flex flex-col items-center text-center opacity-60">
                <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No active exams scheduled for you.</p>
              </div>
            ) : (
              quizzes.map(quiz => {
                const attempt = getAttemptForQuiz(quiz.id);
                return (
                  <div key={quiz.id} className="glass-card p-5 md:p-6 shadow-lg shadow-indigo-100/20 flex flex-col hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black uppercase rounded-full">
                        {quiz.durationMinutes} Mins • {quiz.questions.length} Qs
                      </span>
                      {attempt && (
                        <div className="flex items-center text-green-600 font-black text-lg md:text-xl">
                          <CheckCircle2 className="w-4 md:w-5 h-4 md:h-5 mr-1" />
                          {Math.round((attempt.score/attempt.totalQuestions)*100)}%
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 truncate">{quiz.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-6 md:mb-8 h-10">{quiz.description}</p>
                    
                    <div className="mt-auto pt-6 border-t border-slate-100/50">
                      {attempt ? (
                        <div className="text-center text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                          Submission Verified
                        </div>
                      ) : (
                        <Link
                          to={`/quiz/${quiz.id}`}
                          className="w-full flex items-center justify-center space-x-2 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white transition-all group"
                        >
                          <span>Start Assessment</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Performance History</h3>
              </div>
              
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year Filter:</span>
                <select 
                  value={historyYearFilter}
                  onChange={(e) => setHistoryYearFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-indigo-600 focus:ring-0 outline-none cursor-pointer"
                >
                  <option value="All Years">All Academic Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            {attempts.length === 0 ? (
              <div className="py-20 glass-card flex flex-col items-center text-center opacity-60">
                <History className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No examination history found.</p>
              </div>
            ) : (
              attempts
                .filter(a => {
                  if (historyYearFilter === 'All Years') return true;
                  const quiz = allQuizzes.find(q => q.id === a.quizId);
                  return quiz?.academicYear === historyYearFilter;
                })
                .sort((a,b) => b.timestamp - a.timestamp)
                .map(attempt => {
                const quiz = allQuizzes.find(q => q.id === attempt.quizId);
                return (
                  <div key={attempt.id} className="glass-card p-6 shadow-sm border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-indigo-50/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg">{quiz?.title || 'Unknown Subject'}</p>
                        <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(attempt.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <p className="text-2xl font-black text-indigo-600">
                          {Math.round((attempt.score/attempt.totalQuestions)*100)}%
                        </p>
                        <p className="text-[10px] font-black text-slate-300 uppercase">
                          {attempt.score}/{attempt.totalQuestions} Points
                        </p>
                      </div>
                      <button 
                        onClick={() => openReview(attempt)}
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-black text-[10px] uppercase tracking-widest"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card shadow-lg border-white/60 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Trophy className="w-8 h-8 text-amber-400" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top Performers</h3>
              </div>
              
              <div className="space-y-4">
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-5 rounded-2xl transition-all hover:bg-slate-50 border ${i === 0 ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white/50 border-slate-100'}`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-500' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-slate-900">{entry.studentName}</p>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.totalQuizzes} Exams Completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-black text-indigo-600">{entry.score}%</p>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Class Rank</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'violations' && (
          <motion.div
            key="violations-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {violations.length === 0 ? (
              <div className="py-20 glass-card flex flex-col items-center text-center opacity-60">
                <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No proctoring violations recorded. Keep up the good work!</p>
              </div>
            ) : (
              violations.sort((a,b) => b.timestamp - a.timestamp).map(violation => {
                const quiz = allQuizzes.find(q => q.id === violation.quizId);
                return (
                  <div key={violation.id} className="glass-card p-6 shadow-sm border-white/60 flex flex-col space-y-4 hover:bg-red-50/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{quiz?.title || 'Unknown Subject'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(violation.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                        {violation.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="p-4 bg-white/50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{violation.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
