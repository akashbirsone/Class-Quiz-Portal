
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Search, Filter, Calendar, Users, Activity } from 'lucide-react';
import { Violation, User } from '../../types';
import { Storage } from '../../storage';

const ViolationLogsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');

  useEffect(() => {
    const loadData = async () => {
      const violationsData = await Storage.getViolations();
      setViolations(violationsData);
      const usersData = await Storage.getUsers();
      setUsers(usersData);
    };
    loadData();
  }, []);

  const filteredViolations = violations.filter(v => {
    const student = users.find(u => u.id === v.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All Years' || student?.academicYear === selectedYear;
    const matchesSemester = selectedSemester === 'All Semesters' || student?.semester === selectedSemester;
    return matchesSearch && matchesYear && matchesSemester;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Warning Records</h1>
          <p className="text-slate-500 font-medium">Comprehensive log of all proctoring violations and system warnings.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex-1 relative min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, violation type, or description..."
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
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Violation Type</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <ShieldAlert className="w-12 h-12 mb-4" />
                      <p className="text-slate-500 font-black text-xs uppercase tracking-widest">No Violations Recorded.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredViolations.sort((a,b) => b.timestamp - a.timestamp).map((v) => {
                  const student = users.find(u => u.id === v.studentId);
                  return (
                    <tr key={v.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                            {student?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{student?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student?.rollNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-red-600 uppercase tracking-tight bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                          {v.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-600 font-medium max-w-xs truncate" title={v.description}>{v.description}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-500">{new Date(v.timestamp).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {student?.isBlocked ? (
                          <div className="flex items-center justify-end space-x-1 text-red-600">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 font-black">Blocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Warning</span>
                          </div>
                        )}
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

export default ViolationLogsPage;
