
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, Users, BookOpen, ChevronRight, Activity, Trash2, Calendar, ShieldAlert, UserCheck, UserX, Eye, X, AlertTriangle, CheckCircle2, History, Download, FileText } from 'lucide-react';
import AttemptReview from '../../components/AttemptReview';
import { ReportService } from '../../services/reportService';
import { Quiz, Attempt, User, Violation } from '../../types';
import { Storage } from '../../storage';

const AdminDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [selectedSemester, setSelectedSemester] = useState<string>('All Semesters');
  
  // UI State
  const [selectedStudentViolations, setSelectedStudentViolations] = useState<Violation[] | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Attempt | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const quizzesData = await Storage.getQuizzes();
      setQuizzes(quizzesData);
      const attemptsData = await Storage.getAttempts();
      setAttempts(attemptsData);
      const usersData = await Storage.getUsers();
      setUsers(usersData.filter(u => u.role === 'student'));
      const violationsData = await Storage.getViolations();
      setViolations(violationsData);
    };

    loadData();
  }, [location]);

  const refreshData = async () => {
    const usersData = await Storage.getUsers();
    setUsers(usersData.filter(u => u.role === 'student'));
    const violationsData = await Storage.getViolations();
    setViolations(violationsData);
  };

  const filteredQuizzes = quizzes.filter(q => 
    (selectedYear === 'All Years' || q.academicYear === selectedYear) &&
    (selectedSemester === 'All Semesters' || q.semester === selectedSemester)
  );

  const filteredStudents = users.filter(u => 
    (selectedYear === 'All Years' || u.academicYear === selectedYear) &&
    (selectedSemester === 'All Semesters' || u.semester === selectedSemester)
  );

  const filteredAttempts = attempts.filter(a => filteredQuizzes.some(q => q.id === a.quizId));

  const stats = {
    totalQuizzes: filteredQuizzes.length,
    totalAttempts: filteredAttempts.length,
    avgScore: filteredAttempts.length > 0 
      ? (filteredAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / filteredAttempts.length * 100).toFixed(1)
      : 0,
    blockedStudents: users.filter(u => u.isBlocked).length
  };

  const handleUnblock = async (userId: string) => {
    if (window.confirm('Are you sure you want to manually unblock this student?')) {
      await Storage.unblockUser(userId);
      refreshData();
    }
  };

  const openStudentSubmissions = (student: User) => {
    setSelectedStudent(student);
  };

  const openAttemptReview = (attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setSelectedAttempt(attempt);
    }
  };

  const handlePublish = async (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz && window.confirm('Are you sure you want to publish this exam? It will be visible to students.')) {
      await Storage.saveQuiz({ ...quiz, status: 'published' });
      const quizzesData = await Storage.getQuizzes();
      setQuizzes(quizzesData);
    }
  };

  const handleDownloadReport = (quiz: Quiz) => {
    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
    const quizStudents = users.filter(u => u.academicYear === quiz.academicYear && u.semester === quiz.semester);
    ReportService.generateExamReport(quiz, quizAttempts, quizStudents);
  };

  const handleDownloadStudentReport = (student: User, attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      ReportService.generateStudentReport(student, quiz, attempt);
    }
  };

  const viewViolations = (student: User) => {
    const studentViolations = violations.filter(v => v.studentId === student.id);
    setSelectedStudentViolations(studentViolations);
    setViewingStudent(student);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Attempt Review Modal (Nested) */}
      <AnimatePresence>
        {selectedAttempt && selectedQuiz && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Submission Review</h3>
                  <p className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest mt-1">
                    {selectedStudent?.name} • {selectedQuiz.title}
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
                  Back to Submissions
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Submissions Modal */}
      <AnimatePresence>
        {selectedStudent && !selectedAttempt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-3xl max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">Student Submissions</h3>
                  <p className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest mt-1">
                    {selectedStudent.name} • {selectedStudent.rollNumber}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {attempts.filter(a => a.studentId === selectedStudent.id).length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-black text-xs uppercase tracking-widest">No Submissions Found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts
                      .filter(a => a.studentId === selectedStudent.id)
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map(attempt => {
                        const quiz = quizzes.find(q => q.id === attempt.quizId);
                        return (
                          <div key={attempt.id} className="p-4 md:p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white hover:border-indigo-100 transition-all group">
                            <div>
                              <p className="font-black text-slate-900 text-base md:text-lg">{quiz?.title || 'Unknown Exam'}</p>
                              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {new Date(attempt.timestamp).toLocaleDateString()} • {attempt.score}/{attempt.totalQuestions} Correct
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                              <button 
                                onClick={() => handleDownloadStudentReport(selectedStudent, attempt)}
                                className="flex-1 md:flex-none p-3 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Download Report"
                              >
                                <Download className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => openAttemptReview(attempt)}
                                className="flex-[3] md:flex-none px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Violation Log Modal */}
      <AnimatePresence>
        {viewingStudent && selectedStudentViolations && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">Violation History</h3>
                  <p className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest mt-1">{viewingStudent.name} • {viewingStudent.rollNumber}</p>
                </div>
                <button 
                  onClick={() => { setViewingStudent(null); setSelectedStudentViolations(null); }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {selectedStudentViolations.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-black text-xs uppercase tracking-widest">No Violations Recorded</p>
                  </div>
                ) : (
                  selectedStudentViolations.sort((a, b) => b.timestamp - a.timestamp).map((v) => (
                    <div key={v.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 flex items-start space-x-4">
                      <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-black text-slate-900 uppercase tracking-tight">{v.type.replace('_', ' ')}</p>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(v.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{v.description}</p>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Quiz ID: {v.quizId}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => { setViewingStudent(null); setSelectedStudentViolations(null); }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Close Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/create"
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 active:scale-95 group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            <span>New Assessment</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Filter Context:</span>
        </div>
        
        <select 
          value={selectedYear}
          onChange={(e) => {
            const year = e.target.value;
            setSelectedYear(year);
            if (year === '1st Year') setSelectedSemester('Semester 1');
            else if (year === '2nd Year') setSelectedSemester('Semester 3');
            else if (year === '3rd Year') setSelectedSemester('Semester 5');
            else if (year === '4th Year') setSelectedSemester('Semester 7');
            else setSelectedSemester('All Semesters');
          }}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
        >
          <option value="All Years">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        <select 
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
        >
          <option value="All Semesters">All Semesters</option>
          {selectedYear === 'All Years' ? (
            [1,2,3,4,5,6,7,8].map(s => (
              <option key={s} value={`Semester ${s}`}>Semester {s}</option>
            ))
          ) : (
            <>
              {selectedYear === '1st Year' && (
                <>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </>
              )}
              {selectedYear === '2nd Year' && (
                <>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </>
              )}
              {selectedYear === '3rd Year' && (
                <>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                </>
              )}
              {selectedYear === '4th Year' && (
                <>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </>
              )}
            </>
          )}
        </select>

        {(selectedYear !== 'All Years' || selectedSemester !== 'All Semesters') && (
          <button 
            onClick={() => { setSelectedYear('All Years'); setSelectedSemester('All Semesters'); }}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'System Quizzes', value: stats.totalQuizzes, icon: <BookOpen />, color: 'indigo', path: '/admin/quizzes' },
          { label: 'Active Attempts', value: stats.totalAttempts, icon: <Activity />, color: 'emerald', path: '/admin/attempts' },
          { label: 'Class Proficiency', value: `${stats.avgScore}%`, icon: <BarChart3 />, color: 'blue', path: '/admin/analytics' },
          { label: 'Blocked Users', value: stats.blockedStudents, icon: <ShieldAlert />, color: 'red', path: '/admin/blocked' }
        ].map((stat, i) => (
          <Link 
            key={i} 
            to={stat.path}
            className="block"
          >
            <motion.div 
              variants={itemVariants}
              className="glass-card p-8 border-white/60 shadow-xl shadow-slate-200/50 flex items-center space-x-6 hover:translate-y-[-4px] hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className={`p-5 rounded-3xl bg-${stat.color}-50 text-${stat.color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
                {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-none mt-2">{stat.value}</h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Blocked Student List (Conditional) */}
      {users.filter(u => u.isBlocked).length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-6 md:p-10 border-red-100 shadow-2xl shadow-red-100/50">
          <div className="flex items-center space-x-4 mb-6 md:mb-8">
            <div className="p-3 md:p-4 bg-red-50 text-red-600 rounded-2xl">
              <UserX className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Restricted Students</h3>
              <p className="text-[10px] md:text-sm text-slate-500 font-medium">Currently blocked for violations.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(u => u.isBlocked).map(student => (
              <div key={student.id} className="p-6 bg-red-50/30 rounded-3xl border border-red-100 flex justify-between items-start group">
                <div>
                  <p className="font-black text-slate-900 text-lg">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{student.rollNumber}</p>
                </div>
                <button
                  onClick={() => handleUnblock(student.id)}
                  className="p-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                  title="Unblock Now"
                >
                  <UserCheck className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <motion.div variants={itemVariants} className="glass-card p-8 border-white/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Student Directory</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Manage student profiles, review submissions, and monitor proctoring status.</p>
          </div>
          <Link 
            to="/admin/students"
            className="inline-flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-transform"
          >
            <span>View Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 border-white/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Warning & Block History</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Comprehensive log of all proctoring violations and system warnings.</p>
          </div>
          <Link 
            to="/admin/violations"
            className="inline-flex items-center space-x-2 text-red-600 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-transform"
          >
            <span>View Violation Logs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
