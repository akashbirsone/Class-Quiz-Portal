
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, CheckCircle2, Download, BarChart3, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Quiz, Attempt, User } from '../../types';
import { Storage } from '../../storage';
import { ReportService } from '../../services/reportService';

const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');

  useEffect(() => {
    const loadData = async () => {
      const quizzesData = await Storage.getQuizzes();
      setQuizzes(quizzesData);
      const attemptsData = await Storage.getAttempts();
      setAttempts(attemptsData);
      const usersData = await Storage.getUsers();
      setUsers(usersData.filter(u => u.role === 'student'));
    };
    loadData();
  }, []);

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

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All Years' || q.academicYear === selectedYear;
    const matchesSemester = selectedSemester === 'All Semesters' || q.semester === selectedSemester;
    return matchesSearch && matchesYear && matchesSemester;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">System Quizzes</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all examination sessions.</p>
        </div>
        <Link
          to="/admin/create"
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center space-x-3 active:scale-95 group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          <span>New Assessment</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => {
            const year = e.target.value;
            setSelectedYear(year);
            if (year === 'All Years') {
              setSelectedSemester('All Semesters');
            } else if (year === '1st Year') {
              setSelectedSemester('Semester 1');
            } else if (year === '2nd Year') {
              setSelectedSemester('Semester 3');
            } else if (year === '3rd Year') {
              setSelectedSemester('Semester 5');
            } else if (year === '4th Year') {
              setSelectedSemester('Semester 7');
            }
          }}
          className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
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
          className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
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
      </div>

      <div className="glass-card shadow-2xl border-white/60 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Assessment Profile</th>
                <th className="px-8 py-5">Academic Year</th>
                <th className="px-8 py-5">Semester</th>
                <th className="px-8 py-5">Questions</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <BookOpen className="w-12 h-12 mb-4" />
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No Examinations Found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{quiz.title}</p>
                      <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{quiz.academicYear}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{quiz.semester}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{quiz.questions.length} Items</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{quiz.durationMinutes} Minutes</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${quiz.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${quiz.status === 'published' ? 'bg-green-600 animate-pulse' : 'bg-amber-600'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {quiz.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        {quiz.status === 'draft' && (
                          <button 
                            onClick={() => handlePublish(quiz.id)}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Publish Now"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDownloadReport(quiz)}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Download Full Report"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <Link 
                          to={`/admin/quiz/${quiz.id}`} 
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="View Intelligence"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={async () => {
                            if(window.confirm('IRREVERSIBLE ACTION: Purge this examination session?')) {
                              await Storage.deleteQuiz(quiz.id);
                              const quizzesData = await Storage.getQuizzes();
                              setQuizzes(quizzesData);
                            }
                          }}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Purge Data"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden p-4 space-y-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{quiz.title}</h4>
                  <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">
                    <Calendar className="w-3 h-3 mr-1.5 text-indigo-500" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`shrink-0 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${quiz.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${quiz.status === 'published' ? 'bg-green-600 animate-pulse' : 'bg-amber-600'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {quiz.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Academic Scope</p>
                  <p className="text-xs font-black text-slate-700">{quiz.academicYear}</p>
                  <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{quiz.semester}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Session Info</p>
                  <p className="text-xs font-black text-slate-700">{quiz.questions.length} Questions</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{quiz.durationMinutes} Mins</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link 
                  to={`/admin/quiz/${quiz.id}`} 
                  className="flex-1 flex items-center justify-center space-x-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <button 
                  onClick={async () => {
                    if(window.confirm('IRREVERSIBLE ACTION: Purge this examination session?')) {
                      await Storage.deleteQuiz(quiz.id);
                      const quizzesData = await Storage.getQuizzes();
                      setQuizzes(quizzesData);
                    }
                  }}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
