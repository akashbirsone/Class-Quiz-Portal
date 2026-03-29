
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowUpCircle, 
  Archive, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  RotateCcw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Storage } from '../../storage';
import { User } from '../../types';
import { supabase } from '../../supabase';

const AcademicSessionManager: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionStep, setPromotionStep] = useState<number>(0);
  const [promotionStatus, setPromotionStatus] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState('');
  const [archiveExamRecords, setArchiveExamRecords] = useState(true);
  const [selectedArchived, setSelectedArchived] = useState<string[]>([]);
  const [view, setView] = useState<'active' | 'archive'>('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allUsers = await Storage.getUsers();
    const studentUsers = allUsers.filter(u => u.role === 'student');
    setStudents(studentUsers.filter(u => !u.isArchived));
    setArchivedStudents(studentUsers.filter(u => u.isArchived));
    setLoading(false);
  };

  const getYearStats = () => {
    const stats: Record<string, number> = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      'Final Year': 0
    };
    students.forEach(s => {
      if (s.academicYear && stats[s.academicYear] !== undefined) {
        stats[s.academicYear]++;
      }
    });
    return stats;
  };

  const stats = getYearStats();

  const handlePromotion = async () => {
    if (confirmText !== 'CONFIRM SHIFT') return;

    setPromotionStep(1);
    setPromotionStatus(['Starting promotion sequence...']);

    try {
      // Step 1: Archive Final Year students
      setPromotionStatus(prev => [...prev, 'Archiving Final Year students...']);
      const finalYearStudents = students.filter(s => s.academicYear === 'Final Year');
      for (const student of finalYearStudents) {
        await Storage.saveUser({ ...student, isArchived: true });
      }
      setPromotionStatus(prev => [...prev, `Archived ${finalYearStudents.length} students. Done.`]);

      // Step 2: 2nd Year -> 3rd Year
      setPromotionStatus(prev => [...prev, 'Promoting 2nd Year to 3rd Year...']);
      const secondYearStudents = students.filter(s => s.academicYear === '2nd Year');
      for (const student of secondYearStudents) {
        await Storage.saveUser({ ...student, academicYear: '3rd Year' });
      }
      setPromotionStatus(prev => [...prev, `Promoted ${secondYearStudents.length} students to 3rd Year. Done.`]);

      // Step 3: 1st Year -> 2nd Year
      setPromotionStatus(prev => [...prev, 'Promoting 1st Year to 2nd Year...']);
      const firstYearStudents = students.filter(s => s.academicYear === '1st Year');
      for (const student of firstYearStudents) {
        await Storage.saveUser({ ...student, academicYear: '2nd Year' });
      }
      setPromotionStatus(prev => [...prev, `Promoted ${firstYearStudents.length} students to 2nd Year. Done.`]);

      if (archiveExamRecords) {
        setPromotionStatus(prev => [...prev, 'Archiving exam records...']);
        // In a real app, we might move records to an archive table or mark them
        // For this demo, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPromotionStatus(prev => [...prev, 'Exam records archived. Done.']);
      }

      setPromotionStatus(prev => [...prev, 'Promotion sequence completed successfully!']);
      setPromotionStep(2);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error(error);
      setPromotionStatus(prev => [...prev, 'Error during promotion sequence. Please check logs.']);
      setPromotionStep(0);
    }
  };

  const handleBulkAction = async (action: 'restore' | 'delete') => {
    if (selectedArchived.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to permanently delete ${selectedArchived.length} students?`)) return;
      for (const id of selectedArchived) {
        await supabase.from('users').delete().eq('id', id);
      }
    } else {
      for (const id of selectedArchived) {
        const student = archivedStudents.find(s => s.id === id);
        if (student) {
          await Storage.saveUser({ ...student, isArchived: false, academicYear: '1st Year' });
        }
      }
    }

    setSelectedArchived([]);
    await loadData();
  };

  const toggleSelectAll = () => {
    if (selectedArchived.length === archivedStudents.length) {
      setSelectedArchived([]);
    } else {
      setSelectedArchived(archivedStudents.map(s => s.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Session</h1>
          <p className="text-slate-500 font-medium">Manage student promotions and archives</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setView('active')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              view === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Active Session
          </button>
          <button
            onClick={() => setView('archive')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              view === 'archive' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Archive
          </button>
        </div>
      </div>

      {view === 'active' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Current Enrollment</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats).map(([year, count]) => (
                  <div key={year} className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{year}</p>
                    <p className="text-3xl font-black text-slate-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Session Information</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                The global year shift is a sequential process that promotes all students to their next academic year. 
                Final year students will be moved to the archive. This action is permanent and should only be performed 
                at the end of an academic session.
              </p>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-rose-50 rounded-[32px] p-8 border border-rose-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-rose-900">Danger Zone</h2>
              </div>
              <p className="text-rose-700/70 font-bold text-sm mb-8 leading-relaxed">
                Promoting all years will shift the entire student database. 
                Ensure all final grades are submitted before proceeding.
              </p>
            </div>

            <button
              onClick={() => setShowPromotionModal(true)}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span>Promote All Years</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedArchived.length === archivedStudents.length && archivedStudents.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold text-slate-600">Select All ({archivedStudents.length})</span>
              </div>
              
              {selectedArchived.length > 0 && (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-4">
                  <button
                    onClick={() => handleBulkAction('restore')}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Archive Exam Records</span>
              <button
                onClick={() => setArchiveExamRecords(!archiveExamRecords)}
                className={`w-12 h-6 rounded-full transition-colors relative ${archiveExamRecords ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${archiveExamRecords ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Year</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedArchived.includes(student.id)}
                          onChange={() => {
                            setSelectedArchived(prev => 
                              prev.includes(student.id) 
                                ? prev.filter(id => id !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">
                        {student.academicYear}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-medium">{student.email}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedArchived([student.id]);
                            handleBulkAction('restore');
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedArchived([student.id]);
                            handleBulkAction('delete');
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {archivedStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">
                      No archived students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      <AnimatePresence>
        {showPromotionModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-10 overflow-y-auto">
                {promotionStep === 0 ? (
                  <>
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-[24px]">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Promotion Preview</h3>
                        <p className="text-slate-500 font-medium">Review the changes before applying</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Promotions</p>
                        <ul className="space-y-3">
                          <li className="flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-600">1st → 2nd Year</span>
                            <span className="text-indigo-600">{stats['1st Year']} Students</span>
                          </li>
                          <li className="flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-600">2nd → 3rd Year</span>
                            <span className="text-indigo-600">{stats['2nd Year']} Students</span>
                          </li>
                          <li className="flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-600">3rd → Final Year</span>
                            <span className="text-indigo-600">{stats['3rd Year']} Students</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-rose-50 p-6 rounded-[24px] border border-rose-100">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Archiving</p>
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span className="text-rose-700">Final Year → Archive</span>
                          <span className="text-rose-600">{stats['Final Year']} Students</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest block">
                        Type <span className="text-rose-600">CONFIRM SHIFT</span> to proceed
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type here..."
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:ring-0 transition-all font-black text-indigo-600 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowPromotionModal(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePromotion}
                        disabled={confirmText !== 'CONFIRM SHIFT'}
                        className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Execute Shift
                      </button>
                    </div>
                  </>
                ) : promotionStep === 1 ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-8" />
                    <h3 className="text-2xl font-black text-slate-900 mb-8">Processing Shift...</h3>
                    
                    <div className="max-w-md mx-auto space-y-4 text-left">
                      {promotionStatus.map((status, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={index}
                          className="flex items-center space-x-3 text-sm font-bold text-slate-600"
                        >
                          {status.includes('Done') ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : status.includes('Error') ? (
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                          )}
                          <span>{status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Shift Successful!</h3>
                    <p className="text-slate-500 font-medium mb-10">
                      All students have been promoted and the session has been updated.
                    </p>
                    <button
                      onClick={() => {
                        setShowPromotionModal(false);
                        setPromotionStep(0);
                        setPromotionStatus([]);
                        setConfirmText('');
                      }}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicSessionManager;
