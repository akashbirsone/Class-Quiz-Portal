
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Hash, GraduationCap, ShieldCheck, ArrowRight, Shield, CheckCircle2, X } from 'lucide-react';
import { User } from '../../types';
import { Storage } from '../../storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const ADMIN_VERIFICATION_ID = "9067954030";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loginTab, setLoginTab] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [rollError, setRollError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotData, setForgotData] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '', adminId: '' });
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    academicYear: '1st Year',
    semester: 'Semester 1',
    password: '',
    confirmPassword: ''
  });

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  useEffect(() => {
    const loadUsers = async () => {
      const users = await Storage.getUsers();
      setExistingUsers(users);
    };
    if (view === 'register') {
      loadUsers();
    }
  }, [view]);

  useEffect(() => {
    if (view !== 'register' || !regData.rollNumber) {
      setRollError('');
      return;
    }

    const rollNum = parseInt(regData.rollNumber);
    
    // Range check (1-80)
    if (isNaN(rollNum) || rollNum < 1 || rollNum > 80) {
      setRollError('Roll Number must be between 1 and 80 for this class.');
      return;
    }

    // Year-wise Uniqueness check
    const isDuplicate = existingUsers.some(u => 
      u.role === 'student' && 
      u.academicYear === regData.academicYear && 
      u.rollNumber === regData.rollNumber
    );

    if (isDuplicate) {
      setRollError(`Roll Number ${regData.rollNumber} is already registered in ${regData.academicYear}.`);
    } else {
      setRollError('');
    }
  }, [regData.rollNumber, regData.academicYear, existingUsers, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (loginTab === 'admin') {
      if (loginData.adminId === ADMIN_VERIFICATION_ID) {
        setIsVerified(true);
        // Success animation delay
        await new Promise(r => setTimeout(r, 1000));
        const admin: User = {
          id: 'admin-9067954030',
          name: 'Portal Administrator',
          email: 'admin@portal.edu',
          role: 'admin'
        };
        await Storage.saveUser(admin);
        onLogin(admin);
        navigate('/admin');
      } else {
        setError('Unauthorized Admin ID');
        setIsLoading(false);
      }
      return;
    }

    // Simulate network delay for student
    await new Promise(r => setTimeout(r, 800));

    const users = await Storage.getUsers();
    const user = users.find(u => u.email === loginData.email && u.role === 'student');
    
    if (user) {
      if (user.password && user.password !== loginData.password) {
        setError('Incorrect password.');
        setIsLoading(false);
        return;
      }
      onLogin(user);
      navigate('/student');
    } else if (loginData.email && loginData.password) {
      const dummy: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: loginData.email.split('@')[0],
        email: loginData.email,
        role: 'student',
        academicYear: '2nd Year',
        semester: 'Semester 3'
      };
      await Storage.saveUser(dummy);
      onLogin(dummy);
      navigate('/student');
    } else {
      setError('Please enter valid credentials.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rollError) return;
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: regData.name,
      email: regData.email,
      role: 'student',
      academicYear: regData.academicYear,
      semester: regData.semester,
      rollNumber: regData.rollNumber,
      password: regData.password
    };

    await Storage.saveUser(newUser);
    onLogin(newUser);
    navigate('/student');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    if (getPasswordStrength(forgotData.newPassword) < 50) {
      setForgotError('Password is too weak.');
      return;
    }

    setIsLoading(true);
    try {
      const users = await Storage.getUsers();
      const user = users.find(u => u.email === forgotData.email && u.role === 'student');

      if (!user) {
        setForgotError('No student account found with this email.');
        setIsLoading(false);
        return;
      }

      await Storage.saveUser({
        ...user,
        password: forgotData.newPassword
      });

      setForgotSuccess('Password updated successfully! You can now login.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotData({ email: '', newPassword: '', confirmPassword: '' });
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (isError: boolean) => `
    w-full pl-12 pr-4 py-4 bg-white/50 border ${isError ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'} 
    rounded-2xl outline-none focus:ring-4 transition-all duration-200 text-slate-900 placeholder-slate-400 font-medium
  `;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <motion.div
            key="login-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              boxShadow: isVerified ? "0 0 60px 10px rgba(34, 197, 94, 0.4)" : "0 25px 50px -12px rgba(79, 70, 229, 0.15)"
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-full max-w-md glass-card rounded-[2.5rem] relative z-10 overflow-hidden border ${isVerified ? 'border-green-400' : 'border-white/40'}`}
          >
            <div className="p-8 pb-10">
              {/* Logo Area */}
              <div className="flex justify-center mb-8">
                <motion.div 
                  animate={isVerified ? { scale: [1, 1.2, 1], rotate: [0, 360, 360] } : {}}
                  className={`${isVerified ? 'bg-green-500' : 'bg-indigo-600'} p-5 rounded-3xl shadow-lg transition-colors duration-500`}
                >
                  {isVerified ? <CheckCircle2 className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
                </motion.div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 text-center mb-2 tracking-tight">
                {loginTab === 'admin' ? 'Admin Authorized Entry' : 'Class-Quiz Gateway'}
              </h2>
              <p className="text-slate-500 text-center mb-8 font-medium">
                {loginTab === 'admin' ? 'Identity verification required' : 'Enter your credentials to continue'}
              </p>

              {/* Tabs */}
              <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-8 relative">
                <motion.div
                  className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm z-0"
                  initial={false}
                  animate={{
                    left: loginTab === 'student' ? '6px' : 'calc(50% + 1.5px)',
                    right: loginTab === 'student' ? 'calc(50% + 1.5px)' : '6px'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => { if(!isVerified) { setLoginTab('student'); setError(''); } }}
                  disabled={isVerified}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-200 ${loginTab === 'student' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Student
                </button>
                <button
                  onClick={() => { if(!isVerified) { setLoginTab('admin'); setError(''); } }}
                  disabled={isVerified}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-200 ${loginTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Admin
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <AnimatePresence mode="wait">
                  {loginTab === 'student' ? (
                    <motion.div
                      key="student-fields"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className={inputClasses(!!error)}
                          placeholder="Institute Email"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className={inputClasses(!!error)}
                          placeholder="Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="admin-fields"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="relative">
                        <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isVerified ? 'text-green-500' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          disabled={isVerified}
                          value={loginData.adminId}
                          onChange={(e) => setLoginData({ ...loginData, adminId: e.target.value })}
                          className={`${inputClasses(!!error)} text-center tracking-[0.5em] text-xl font-black ${isVerified ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                          placeholder="••••••••••"
                          maxLength={10}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] text-center">Identity verification required for root access</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-black text-center uppercase tracking-widest px-4 py-2 bg-red-50 rounded-xl">
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isVerified}
                  className={`w-full py-5 ${isVerified ? 'bg-green-500' : 'bg-slate-900 hover:bg-indigo-600'} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-90`}
                >
                  {isLoading && !isVerified ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isVerified ? (
                    <>
                      <span>Access Granted</span>
                      <ShieldCheck className="w-6 h-6" />
                    </>
                  ) : (
                    <>
                      <span>{loginTab === 'admin' ? 'Admin ID Verify' : 'Student Login'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="p-6 bg-slate-50/80 border-t border-white/40 text-center">
              <button
                disabled={isVerified}
                onClick={() => { setView('register'); setError(''); }}
                className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                New Candidate? <span className="text-indigo-600 border-b-2 border-indigo-600/20 pb-0.5 ml-1">Enroll Now</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-2xl glass-card rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-10">
              <div className="flex items-center space-x-6 mb-10">
                <button
                  onClick={() => setView('login')}
                  className="p-3.5 rounded-2xl bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Student Enrollment</h2>
                  <p className="text-slate-500 font-medium">Register for the current academic session</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          className={inputClasses(false)}
                          placeholder="e.g. Liam Smith"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Roll Number</label>
                      <div className="relative">
                        <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${rollError ? 'text-red-400' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          value={regData.rollNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setRegData({ ...regData, rollNumber: val });
                            }
                          }}
                          className={inputClasses(!!rollError)}
                          placeholder="1-80"
                        />
                      </div>
                      {rollError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] font-bold text-red-500 mt-1.5 ml-1"
                        >
                          {rollError}
                        </motion.p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Academic Year</label>
                      <div className="flex p-1.5 bg-slate-100/80 rounded-[20px] gap-2">
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => {
                              let semester = 'Semester 1';
                              if (year === '2nd Year') semester = 'Semester 3';
                              else if (year === '3rd Year') semester = 'Semester 5';
                              else if (year === '4th Year') semester = 'Semester 7';
                              setRegData({ ...regData, academicYear: year, semester });
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${regData.academicYear === year ? 'bg-white shadow-sm text-indigo-600 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {year.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Semester</label>
                      <select
                        value={regData.semester}
                        onChange={(e) => setRegData({ ...regData, semester: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-200 transition-all font-bold text-slate-900 text-sm appearance-none"
                      >
                        {regData.academicYear === '1st Year' && (
                          <>
                            <option value="Semester 1">Semester 1</option>
                            <option value="Semester 2">Semester 2</option>
                          </>
                        )}
                        {regData.academicYear === '2nd Year' && (
                          <>
                            <option value="Semester 3">Semester 3</option>
                            <option value="Semester 4">Semester 4</option>
                          </>
                        )}
                        {regData.academicYear === '3rd Year' && (
                          <>
                            <option value="Semester 5">Semester 5</option>
                            <option value="Semester 6">Semester 6</option>
                          </>
                        )}
                        {regData.academicYear === '4th Year' && (
                          <>
                            <option value="Semester 7">Semester 7</option>
                            <option value="Semester 8">Semester 8</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Institute Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          className={inputClasses(false)}
                          placeholder="liam.s@institute.edu"
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Security Credentials</label>
                        <div className="space-y-4">
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={regData.password}
                              onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                              className={inputClasses(false)}
                              placeholder="Create Password"
                            />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={regData.confirmPassword}
                              onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                              className={inputClasses(false)}
                              placeholder="Confirm Password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Strength */}
                      <div className="space-y-3 px-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          <span>Security Strength</span>
                          <span className={regData.password ? 'text-indigo-600' : ''}>
                            {getPasswordStrength(regData.password) === 100 ? 'Immune' : getPasswordStrength(regData.password) >= 50 ? 'Secured' : 'Vulnerable'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getPasswordStrength(regData.password) < 50 ? 'bg-amber-400' : 'bg-indigo-600'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPasswordStrength(regData.password)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="text-red-500 text-xs font-black text-center uppercase tracking-widest bg-red-50 p-3 rounded-xl">{error}</div>}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !!rollError}
                    className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Complete Enrollment</span>
                        <GraduationCap className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowForgotModal(false)}
                className="absolute right-6 top-6 p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[24px]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Reset Password</h3>
                    <p className="text-slate-500 font-medium">Update your security credentials</p>
                  </div>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotData.email}
                      onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                      className={inputClasses(!!forgotError)}
                      placeholder="Institute Email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                      className={inputClasses(!!forgotError)}
                      placeholder="New Password"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                      className={inputClasses(!!forgotError)}
                      placeholder="Confirm New Password"
                    />
                  </div>

                  {forgotError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-black text-center uppercase tracking-widest bg-red-50 p-3 rounded-xl">
                      {forgotError}
                    </motion.div>
                  )}

                  {forgotSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs font-black text-center uppercase tracking-widest bg-green-50 p-3 rounded-xl">
                      {forgotSuccess}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <CheckCircle2 className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
