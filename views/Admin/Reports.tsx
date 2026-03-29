
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Calendar, Filter, Search, ChevronRight, BookOpen, Users, Activity, CheckCircle2, X } from 'lucide-react';
import { Quiz, Attempt, User } from '../../types';
import { Storage } from '../../storage';
import { ReportService } from '../../services/reportService';

const ReportsPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [reportFilters, setReportFilters] = useState({
    academicYear: 'All Years',
    semester: 'All Semesters',
    quizId: 'All Exams',
    studentId: 'All Students'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const quizzesData = await Storage.getQuizzes();
      setQuizzes(quizzesData);
      const attemptsData = await Storage.getAttempts();
      setAttempts(attemptsData);
      const usersData = await Storage.getUsers();
      setUsers(usersData.filter(u => u.role === 'student'));
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDownloadAdvancedReport = () => {
    ReportService.generateAdvancedReport(quizzes, attempts, users, reportFilters);
  };

  const classKeys = Array.from(new Set(quizzes.map(q => `${q.academicYear}|${q.semester}`))).sort();

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Reports</h1>
          <p className="text-slate-500 font-medium">Generate and download comprehensive performance reports.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-700 pr-4">Excel Format Supported</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Advanced Report Configurator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 border-white/60 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-3">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span>Custom Export</span>
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</label>
                <select 
                  value={reportFilters.academicYear}
                  onChange={(e) => {
                    const year = e.target.value;
                    let semester = reportFilters.semester;
                    if (year === 'All Years') {
                      semester = 'All Semesters';
                    } else if (year === '1st Year') {
                      semester = 'Semester 1';
                    } else if (year === '2nd Year') {
                      semester = 'Semester 3';
                    } else if (year === '3rd Year') {
                      semester = 'Semester 5';
                    } else if (year === '4th Year') {
                      semester = 'Semester 7';
                    }
                    setReportFilters({...reportFilters, academicYear: year, semester});
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="All Years">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</label>
                <select 
                  value={reportFilters.semester}
                  onChange={(e) => setReportFilters({...reportFilters, semester: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="All Semesters">All Semesters</option>
                  {reportFilters.academicYear === 'All Years' ? (
                    [1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                    ))
                  ) : (
                    <>
                      {reportFilters.academicYear === '1st Year' && (
                        <>
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                        </>
                      )}
                      {reportFilters.academicYear === '2nd Year' && (
                        <>
                          <option value="Semester 3">Semester 3</option>
                          <option value="Semester 4">Semester 4</option>
                        </>
                      )}
                      {reportFilters.academicYear === '3rd Year' && (
                        <>
                          <option value="Semester 5">Semester 5</option>
                          <option value="Semester 6">Semester 6</option>
                        </>
                      )}
                      {reportFilters.academicYear === '4th Year' && (
                        <>
                          <option value="Semester 7">Semester 7</option>
                          <option value="Semester 8">Semester 8</option>
                        </>
                      )}
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Exam</label>
                <select 
                  value={reportFilters.quizId}
                  onChange={(e) => setReportFilters({...reportFilters, quizId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="All Exams">All Exams</option>
                  {quizzes.map(q => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Student</label>
                <select 
                  value={reportFilters.studentId}
                  onChange={(e) => setReportFilters({...reportFilters, studentId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="All Students">All Students</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.rollNumber})</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleDownloadAdvancedReport}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3"
              >
                <Download className="w-5 h-5" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Class-wise Quick Reports */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Class Reports</h2>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {classKeys.length} Classes Found
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-widest">Loading Data...</p>
            </div>
          ) : classKeys.length === 0 ? (
            <div className="py-20 glass-card flex flex-col items-center text-center opacity-40">
              <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
              <p className="font-black text-xs uppercase tracking-widest">No Class Data Available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(classKeys as string[]).map((key) => {
                const [year, semester] = key.split('|');
                const classAttempts = attempts.filter(a => {
                  const q = quizzes.find(quiz => quiz.id === a.quizId);
                  return q?.academicYear === year && q?.semester === semester;
                });

                if (classAttempts.length === 0) return null;

                const avgScore = (classAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / classAttempts.length * 100).toFixed(0);

                return (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-white/60 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600">{avgScore}%</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avg. Proficiency</p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-black text-slate-900">{year}</h3>
                      <p className="text-sm font-bold text-slate-500">{semester}</p>
                    </div>

                    <div className="flex items-center justify-between mb-8 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-600">{classAttempts.length} Submissions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-600">Active</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => ReportService.generateAdvancedReport(quizzes, attempts, users, { academicYear: year, semester: semester })}
                      className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Excel Report</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
