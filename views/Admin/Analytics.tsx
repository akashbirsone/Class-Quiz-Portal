
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Target, Users, BookOpen, Award } from 'lucide-react';
import { Quiz, Attempt, User } from '../../types';
import { Storage } from '../../storage';

const AnalyticsPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
    avgScore: filteredAttempts.length > 0 
      ? (filteredAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / filteredAttempts.length * 100).toFixed(1)
      : 0,
    totalExams: filteredQuizzes.length,
    totalStudents: filteredStudents.length,
    highPerformers: filteredAttempts.filter(a => (a.score / a.totalQuestions) >= 0.8).length
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Class Proficiency</h1>
          <p className="text-slate-500 font-medium">Deep dive into performance analytics and trends.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-700 pr-4">Up 12% this month</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Proficiency', value: `${stats.avgScore}%`, icon: <Target />, color: 'indigo' },
          { label: 'Total Assessments', value: stats.totalExams, icon: <BookOpen />, color: 'emerald' },
          { label: 'Active Students', value: stats.totalStudents, icon: <Users />, color: 'blue' },
          { label: 'High Performers', value: stats.highPerformers, icon: <Award />, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/60 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 shadow-inner`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-white/60 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3">
              <PieChart className="w-6 h-6 text-indigo-600" />
              <span>Score Distribution</span>
            </h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Excellent (80-100%)', count: filteredAttempts.filter(a => (a.score/a.totalQuestions) >= 0.8).length, color: 'bg-emerald-500' },
              { label: 'Good (60-79%)', count: filteredAttempts.filter(a => (a.score/a.totalQuestions) >= 0.6 && (a.score/a.totalQuestions) < 0.8).length, color: 'bg-indigo-500' },
              { label: 'Average (40-59%)', count: filteredAttempts.filter(a => (a.score/a.totalQuestions) >= 0.4 && (a.score/a.totalQuestions) < 0.6).length, color: 'bg-amber-500' },
              { label: 'Needs Improvement (<40%)', count: filteredAttempts.filter(a => (a.score/a.totalQuestions) < 0.4).length, color: 'bg-red-500' }
            ].map((item, i) => {
              const percentage = filteredAttempts.length > 0 ? (item.count / filteredAttempts.length) * 100 : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.count} Students</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-8 border-white/60 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <span>Top Performing Exams</span>
            </h3>
          </div>
          <div className="space-y-4">
            {filteredQuizzes.slice(0, 5).map((quiz, i) => {
              const quizAttempts = filteredAttempts.filter(a => a.quizId === quiz.id);
              const avg = quizAttempts.length > 0 
                ? (quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / quizAttempts.length * 100).toFixed(0)
                : 0;
              
              return (
                <div key={quiz.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-indigo-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{quiz.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quizAttempts.length} Submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{avg}%</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avg. Score</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
