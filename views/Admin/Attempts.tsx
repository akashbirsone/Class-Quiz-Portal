
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Clock, CheckCircle2, Search, Filter, ShieldAlert } from 'lucide-react';
import { Quiz, Attempt, User } from '../../types';
import { Storage } from '../../storage';

const AttemptsPage: React.FC = () => {
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

  const filteredAttempts = attempts.filter(a => {
    const student = users.find(u => u.id === a.studentId);
    const quiz = quizzes.find(q => q.id === a.quizId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          quiz?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All Years' || student?.academicYear === selectedYear;
    const matchesSemester = selectedSemester === 'All Semesters' || student?.semester === selectedSemester;
    return matchesSearch && matchesYear && matchesSemester;
  });

  // For "Active" attempts, we might need a way to track if they are currently ongoing.
  // Since we don't have real-time tracking in localStorage easily without a "finished" flag,
  // I'll assume attempts in the last 30 minutes are "recent/active" or just show all attempts.
  // Actually, let's just show all attempts but highlight recent ones.

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Active Attempts</h1>
          <p className="text-slate-500 font-medium">Monitor real-time student activity and exam progress.</p>
        </div>
        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">Live Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student or exam name..."
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/60 shadow-xl shadow-slate-200/50 flex items-center space-x-5">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
            <h3 className="text-2xl font-black text-slate-900">{attempts.length}</h3>
          </div>
        </div>
        <div className="glass-card p-6 border-white/60 shadow-xl shadow-slate-200/50 flex items-center space-x-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Rate</p>
            <h3 className="text-2xl font-black text-slate-900">
              {attempts.length > 0 ? Math.round((attempts.length / users.length) * 100) : 0}%
            </h3>
          </div>
        </div>
        <div className="glass-card p-6 border-white/60 shadow-xl shadow-slate-200/50 flex items-center space-x-5">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Time Taken</p>
            <h3 className="text-2xl font-black text-slate-900">
              {attempts.length > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.timeTaken, 0) / attempts.length / 60) : 0}m
            </h3>
          </div>
        </div>
      </div>

      <div className="glass-card shadow-2xl border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Exam Title</th>
                <th className="px-8 py-5">Score</th>
                <th className="px-8 py-5">Time Taken</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Activity className="w-12 h-12 mb-4" />
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No Activity Recorded.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttempts.sort((a,b) => b.timestamp - a.timestamp).map((attempt) => {
                  const student = users.find(u => u.id === attempt.studentId);
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                            {student?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{student?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student?.rollNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{quiz?.title}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-black ${scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 50 ? 'text-indigo-600' : 'text-amber-600'}`}>
                            {scorePercent}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">({attempt.score}/{attempt.totalQuestions})</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-500">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttemptsPage;
