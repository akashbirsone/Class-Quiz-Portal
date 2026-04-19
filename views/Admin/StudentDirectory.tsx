
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, History, Eye, UserCheck, UserX, X, Download, AlertTriangle, ShieldAlert, BookOpen, GraduationCap } from 'lucide-react';
import { User, Attempt, Quiz, Violation } from '../../types';
import { Storage } from '../../storage';
import { ReportService } from '../../services/reportService';
import AttemptReview from '../../components/AttemptReview';

const StudentDirectoryPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedViolationStudent, setSelectedViolationStudent] = useState<User | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ academicYear: '', semester: '' });
  const [submissionYearFilter, setSubmissionYearFilter] = useState('All Years');

  useEffect(() => {
    const loadData = async () => {
      const usersData = await Storage.getUsers();
      setUsers(usersData.filter(u => u.role === 'student'));
      const attemptsData = await Storage.getAttempts();
      setAttempts(attemptsData);
      const quizzesData = await Storage.getQuizzes();
      setQuizzes(quizzesData);
      const violationsData = await Storage.getViolations();
      setViolations(violationsData);
    };
    loadData();
  }, []);

  const filteredStudents = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All Years' || u.academicYear === selectedYear;
    const matchesSemester = selectedSemester === 'All Semesters' || u.semester === selectedSemester;
    return matchesSearch && matchesYear && matchesSemester;
  });

  const openAttemptReview = (attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setSelectedAttempt(attempt);
    }
  };

  const handleDownloadStudentReport = (student: User, attempt: Attempt) => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      ReportService.generateStudentReport(student, quiz, attempt);
    }
  };

  const startEditing = (student: User) => {
    setEditingStudent(student);
    setEditForm({
      academicYear: student.academicYear || '1st Year',
      semester: student.semester || 'Semester 1'
    });
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    const updatedUser = {
      ...editingStudent,
      academicYear: editForm.academicYear,
      semester: editForm.semester
    };

    await Storage.saveUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingStudent(null);
  };

  const handleToggleBlockStatus = async (student: User) => {
    const updatedUser = {
      ...student,
      isBlocked: !student.isBlocked
    };
    await Storage.saveUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 font-medium">Manage student profiles, review submissions, and monitor status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Student Info</th>
                <th className="px-8 py-5">Academic Details</th>
                <th className="px-8 py-5">Roll Number</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Performance</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Users className="w-12 h-12 mb-4" />
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No Students Found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentAttempts = attempts.filter(a => a.studentId === student.id);
                  const avgScore = studentAttempts.length > 0
                    ? (studentAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / studentAttempts.length * 100).toFixed(1)
                    : 'N/A';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <Link to={`/admin/student/${student.id}`} className="hover:text-indigo-600 transition-colors">
                            <p className="font-black text-slate-900 text-lg group-hover:text-indigo-600">{student.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                          </Link>
                          <button
                            onClick={() => setSelectedViolationStudent(student)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            title="View Violations"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center text-xs font-black text-slate-700 uppercase tracking-tight">
                            <GraduationCap className="w-3 h-3 mr-1 text-indigo-500" />
                            {student.academicYear || 'N/A'}
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <BookOpen className="w-3 h-3 mr-1 text-slate-300" />
                            {student.semester || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-600">{student.rollNumber || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest inline-flex items-center space-x-2 ${student.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {student.isBlocked ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>{student.isBlocked ? 'Blocked' : 'Active'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{avgScore}% Avg</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{studentAttempts.length} Assessments</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleBlockStatus(student)}
                            className={`p-3 rounded-xl transition-all shadow-sm ${student.isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
                            title={student.isBlocked ? "Unblock Student" : "Block Student"}
                          >
                            {student.isBlocked ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => startEditing(student)}
                            className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Edit Year/Semester"
                          >
                            <GraduationCap className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="View Submissions"
                          >
                            <History className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submissions Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Student Submissions</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
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
              
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year Filter:</p>
                </div>
                <select 
                  value={submissionYearFilter}
                  onChange={(e) => setSubmissionYearFilter(e.target.value)}
                  className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-indigo-600 focus:ring-0 outline-none cursor-pointer shadow-sm"
                >
                  <option value="All Years">All Academic Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {attempts.filter(a => {
                  if (submissionYearFilter === 'All Years') return a.studentId === selectedStudent.id;
                  const quiz = quizzes.find(q => q.id === a.quizId);
                  return a.studentId === selectedStudent.id && quiz?.academicYear === submissionYearFilter;
                }).length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-black text-xs uppercase tracking-widest">No Submissions Found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts
                      .filter(a => {
                        if (submissionYearFilter === 'All Years') return a.studentId === selectedStudent.id;
                        const quiz = quizzes.find(q => q.id === a.quizId);
                        return a.studentId === selectedStudent.id && quiz?.academicYear === submissionYearFilter;
                      })
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map(attempt => {
                        const quiz = quizzes.find(q => q.id === attempt.quizId);
                        return (
                          <div key={attempt.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-100 transition-all group">
                            <div>
                              <p className="font-black text-slate-900 text-lg">{quiz?.title || 'Unknown Exam'}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {new Date(attempt.timestamp).toLocaleDateString()} • {attempt.score}/{attempt.totalQuestions} Correct
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleDownloadStudentReport(selectedStudent, attempt)}
                                className="p-3 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Download Report"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openAttemptReview(attempt)}
                                className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
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

      {/* Violations Modal */}
      <AnimatePresence>
        {selectedViolationStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Proctoring Violations</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                    {selectedViolationStudent.name} • {selectedViolationStudent.rollNumber}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedViolationStudent(null)}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {violations.filter(v => v.studentId === selectedViolationStudent.id).length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-black text-xs uppercase tracking-widest">No Violations Recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {violations
                      .filter(v => v.studentId === selectedViolationStudent.id)
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map(violation => {
                        const quiz = quizzes.find(q => q.id === violation.quizId);
                        return (
                          <div key={violation.id} className="p-6 bg-red-50/50 rounded-3xl border border-red-100 flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-red-600 uppercase tracking-tight bg-white px-3 py-1 rounded-lg border border-red-100">
                                {violation.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(violation.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{quiz?.title || 'Unknown Exam'}</p>
                              <p className="text-sm text-slate-600 mt-1">{violation.description}</p>
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

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-2">Update Academic Year</h3>
              <p className="text-slate-500 mb-8 font-medium">Update Year and Semester for {editingStudent.name}.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Academic Year</label>
                  <select 
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Semester</label>
                  <select 
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStudent}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
    </div>
  );
};

export default StudentDirectoryPage;
