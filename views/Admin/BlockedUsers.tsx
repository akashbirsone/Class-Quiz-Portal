
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserX, UserCheck, ShieldAlert, Search, AlertTriangle, Clock, History } from 'lucide-react';
import { User, Violation } from '../../types';
import { Storage } from '../../storage';

const BlockedUsersPage: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const users = await Storage.getUsers();
      setBlockedUsers(users.filter(u => u.role === 'student' && u.isBlocked));
      const violationsData = await Storage.getViolations();
      setViolations(violationsData);
    };
    loadData();
  }, []);

  const handleUnblock = async (userId: string) => {
    if (window.confirm('Are you sure you want to manually unblock this student?')) {
      await Storage.unblockUser(userId);
      const users = await Storage.getUsers();
      setBlockedUsers(users.filter(u => u.role === 'student' && u.isBlocked));
    }
  };

  const filteredUsers = blockedUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Blocked Students</h1>
          <p className="text-slate-500 font-medium">Review and manage students restricted due to proctoring violations.</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span className="text-sm font-black text-red-700 uppercase tracking-widest">{blockedUsers.length} Students Restricted</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="glass-card py-24 text-center border-white/60 shadow-xl">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No Blocked Students</h3>
            <p className="text-slate-500 font-medium mt-2">All students currently have active access to the system.</p>
          </div>
        ) : (
          filteredUsers.map((student) => {
            const studentViolations = violations.filter(v => v.studentId === student.id);
            const lastViolation = studentViolations.sort((a,b) => b.timestamp - a.timestamp)[0];

            return (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden border-white/60 shadow-2xl"
              >
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 rounded-[24px] bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-inner shrink-0">
                      <UserX className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{student.name}</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{student.rollNumber} • {student.academicYear}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1.5" />
                          {student.warningCount} Warnings
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full border border-slate-200 flex items-center">
                          <Clock className="w-3 h-3 mr-1.5" />
                          Restricted Access
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Reason</p>
                      <p className="text-sm font-bold text-slate-700 max-w-xs">{lastViolation?.description || 'Multiple Proctoring Violations'}</p>
                    </div>
                    <button 
                      onClick={() => handleUnblock(student.id)}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-95"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Restore Access</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50/50 border-t border-slate-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <History className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Violation History</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentViolations.slice(0, 2).map((v) => (
                      <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{v.type.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{new Date(v.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BlockedUsersPage;
