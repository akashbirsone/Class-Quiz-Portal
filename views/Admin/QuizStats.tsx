
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Quiz, Attempt, User } from '../../types';
import { Storage } from '../../storage';
// Added Activity to the imports from lucide-react
import { ArrowLeft, BarChart3, Users, CheckCircle2, Clock, Calendar, AlertCircle, ChevronRight, Download, Activity, X, Eye } from 'lucide-react';
import AttemptReview from '../../components/AttemptReview';
import { ReportService } from '../../services/reportService';
import { AnimatePresence } from 'framer-motion';

const QuizStats: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const allQuizzes = await Storage.getQuizzes();
      const q = allQuizzes.find(item => item.id === id);
      if (q) {
        setQuiz(q);
        const allAttempts = await Storage.getAttempts();
        setAttempts(allAttempts.filter(a => a.quizId === id));
        const allUsers = await Storage.getUsers();
        setStudents(allUsers.filter(u => u.role === 'student' && u.academicYear === q.academicYear && u.semester === q.semester));
      }
    };
    loadData();
  }, [id]);

  if (!quiz) return (
    <div className="p-20 text-center glass-card border-red-100 m-8">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-slate-900">Session Restricted or Deleted</h2>
      <Link to="/admin" className="text-indigo-600 font-bold mt-4 inline-block">Return to Command Center</Link>
    </div>
  );

  const attemptedStudentIds = new Set(attempts.map(a => a.studentId));
  const notAttempted = students.filter(s => !attemptedStudentIds.has(s.id));

  const averageScore = attempts.length > 0 
    ? (attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length * 100).toFixed(1)
    : 0;

  const completionRate = students.length > 0 ? Math.round((attempts.length / students.length) * 100) : 0;

  const openReview = (attempt: Attempt, student: User | undefined) => {
    setSelectedAttempt(attempt);
    if (student) setViewingStudent(student);
  };

  const handleDownloadFullReport = () => {
    if (quiz) {
      ReportService.generateExamReport(quiz, attempts, students);
    }
  };

  const handleDownloadStudentReport = (student: User, attempt: Attempt) => {
    if (quiz) {
      ReportService.generateStudentReport(student, quiz, attempt);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Attempt Review Modal */}
      <AnimatePresence>
        {selectedAttempt && quiz && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
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
                    {viewingStudent?.name || 'Unknown Student'} • {viewingStudent?.rollNumber || 'NO-ID'}
                  </p>
                </div>
                <button 
                  onClick={() => { setSelectedAttempt(null); setViewingStudent(null); }}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <AttemptReview quiz={quiz} attempt={selectedAttempt} />
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => { setSelectedAttempt(null); setViewingStudent(null); }}
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
        <div>
          <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-[0.2em] flex items-center space-x-2 mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Operational Console</span>
          </Link>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{quiz.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-slate-500 font-medium">Cohort Analytics: {quiz.academicYear}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">{quiz.active ? 'Operational' : 'Archived'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="glass-card px-5 md:px-8 py-3 md:py-5 shadow-xl border-white/60 text-center">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Proficiency</p>
            <p className="text-2xl md:text-3xl font-black text-indigo-600 leading-none">{averageScore}%</p>
          </div>
          <button 
            onClick={handleDownloadFullReport}
            className="p-5 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
            title="Download Full Report"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Monitoring Panel */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card shadow-2xl border-white/60 overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100/50 flex justify-between items-center bg-white/30">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center space-x-3">
                {/* Fixed missing Activity icon by adding it to lucide-react imports */}
                <Activity className="w-6 h-6 text-indigo-600" />
                <span>Real-time Submission Tracking</span>
              </h3>
              <div className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {completionRate}% Complete
              </div>
            </div>
            
            <div className="p-8">
              <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-10 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-indigo-600 h-full shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Validated', value: attempts.length, color: 'indigo' },
                  { label: 'Unattempted', value: notAttempted.length, color: 'slate' },
                  { label: 'Cohort Size', value: students.length, color: 'blue' },
                  { label: 'Success Rate', value: `${Math.round(completionRate)}%`, color: 'emerald' }
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 md:p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-xl md:text-2xl font-black text-${s.color}-600`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100/50">
               <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {attempts.length === 0 ? (
                    <div className="p-12 text-center opacity-40">
                      <Clock className="w-10 h-10 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Initial Submission</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                <tr className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-4 md:px-8 py-4 text-left">Identity</th>
                  <th className="px-4 md:px-8 py-4 text-center">Score</th>
                  <th className="px-4 md:px-8 py-4 text-right">Verification</th>
                </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {attempts.sort((a,b) => b.timestamp - a.timestamp).map(attempt => {
                          const student = students.find(s => s.id === attempt.studentId);
                          const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                          return (
                            <tr key={attempt.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-4 md:px-8 py-4 md:py-5">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 text-[10px] md:text-xs shadow-inner">
                                    {student?.name?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 text-sm md:text-base">{student?.name || 'Deactivated Account'}</p>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student?.rollNumber || 'NO-ID'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-5 text-center">
                                <div className="inline-block">
                                  <p className={`text-lg md:text-xl font-black ${scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-indigo-600' : 'text-amber-600'}`}>
                                    {scorePercent}%
                                  </p>
                                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">{attempt.score}/{attempt.totalQuestions}</p>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                                <div className="flex items-center justify-end space-x-2 md:space-x-4">
                                  <div className="hidden sm:inline-flex flex-col items-end">
                                    <div className="flex items-center space-x-1.5 text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                      <CheckCircle2 className="w-3 md:w-3.5 h-3 md:h-3.5 text-indigo-600" />
                                      <span>{new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1">{attempt.timeTaken}s latency</span>
                                  </div>
                                  <button 
                                    onClick={() => student && handleDownloadStudentReport(student, attempt)}
                                    className="p-2 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    title="Download Student Report"
                                  >
                                    <Download className="w-4 md:w-5 h-4 md:h-5" />
                                  </button>
                                  <button 
                                    onClick={() => openReview(attempt, student)}
                                    className="p-2 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    title="Review Submission"
                                  >
                                    <Eye className="w-4 md:w-5 h-4 md:h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
               </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Cohort Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card shadow-2xl border-white/60 overflow-hidden sticky top-24"
          >
            <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black tracking-tight flex items-center space-x-3">
                <Users className="w-6 h-6" />
                <span>Pending Access</span>
              </h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">{notAttempted.length}</span>
            </div>
            <div className="p-8">
              {notAttempted.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Cycle Complete</h4>
                  <p className="text-slate-500 font-medium px-4 leading-relaxed">All students in the academic session have successfully submitted their responses.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Awaiting Authorization</p>
                  <div className="space-y-3">
                    {notAttempted.map(student => (
                      <div key={student.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black">
                            {student.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm leading-none mb-1">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-4 bg-slate-100 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-transparent hover:border-indigo-100">
                    Send Mass Notification
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizStats;
