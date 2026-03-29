
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Camera, UserX, AlertTriangle } from 'lucide-react';
import { Quiz, Attempt, Violation, ViolationType } from '../../types';
import { Storage } from '../../storage';
import { ProctoringService, ProctoringEvent } from '../../ProctoringService';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<number | null>(null);
  
  // Proctoring State
  const videoRef = useRef<HTMLVideoElement>(null);
  const proctoringServiceRef = useRef<ProctoringService | null>(null);
  const [warningCount, setWarningCount] = useState(0);
  const [lastViolation, setLastViolation] = useState<ProctoringEvent | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const user = Storage.getCurrentUser();
      if (user?.isBlocked) {
        setIsBlocked(true);
        return;
      }

      const allQuizzes = await Storage.getQuizzes();
      const q = allQuizzes.find(item => item.id === id);
      if (q) {
        setQuiz(q);
        setTimeLeft(q.durationMinutes * 60);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!quiz || isSubmitted || isBlocked) return;

    const initProctoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        proctoringServiceRef.current = new ProctoringService(handleViolation);
        await proctoringServiceRef.current.initialize();
        if (videoRef.current) {
          proctoringServiceRef.current.startMonitoring(videoRef.current);
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
        alert('Camera access is required for this exam.');
        navigate('/student');
      }
    };

    initProctoring();

    return () => {
      if (proctoringServiceRef.current) {
        proctoringServiceRef.current.stopMonitoring();
      }
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [quiz, isSubmitted, isBlocked]);

  const handleViolation = async (event: ProctoringEvent) => {
    const user = Storage.getCurrentUser();
    if (!user || !quiz) return;

    // Special handling for tab switching/blur
    if (event.type === 'TAB_SWITCH' || event.type === 'WINDOW_BLUR') {
      setShowExitConfirm(true);
    }

    const violation: Violation = {
      id: Math.random().toString(36).substring(2, 9),
      studentId: user.id,
      quizId: quiz.id,
      type: event.type,
      timestamp: Date.now(),
      description: event.description
    };

    await Storage.saveViolation(violation);
    
    setLastViolation(event);
    setWarningCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsBlocked(true);
        handleSubmit(); 
      } else {
        setShowWarningModal(true);
        setTimeout(() => setShowWarningModal(false), 5000);
      }
      return next;
    });
  };

  useEffect(() => {
    if (quiz && !isSubmitted && timeLeft > 0 && !isBlocked) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, isSubmitted, timeLeft, isBlocked]);

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    if (!quiz || isSubmitted) return;
    
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop proctoring
    if (proctoringServiceRef.current) {
      proctoringServiceRef.current.stopMonitoring();
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());

    let score = 0;
    quiz.questions.forEach(q => {
      // Only increment if the answer exists and is correct
      if (answers[q.id] !== undefined && answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const user = Storage.getCurrentUser();
    if (!user) return;

    const attempt: Attempt = {
      id: Math.random().toString(36).substring(2, 9),
      quizId: quiz.id,
      studentId: user.id,
      score,
      totalQuestions: quiz.questions.length,
      timeTaken: Math.floor((Date.now() - startTime) / 1000),
      timestamp: Date.now(),
      answers: { ...answers } // Ensure we store the state as it was
    };

    await Storage.saveAttempt(attempt);
    
    if (isAuto) {
      alert("Time is up! Your exam has been automatically submitted.");
    }
  };

  if (isBlocked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 shadow-2xl text-center border-red-100 bg-red-50/30"
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <UserX className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Access Blocked</h2>
          <p className="text-red-600 font-bold mb-6">Multiple proctoring violations detected.</p>
          <p className="text-slate-500 mb-10">
            Your account has been automatically blocked for 24 hours due to suspicious behavior. 
            Please contact the administrator for further assistance.
          </p>
          <button
            onClick={() => navigate('/student')}
            className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black text-lg hover:bg-slate-800 transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!quiz) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (isSubmitted) {
    const score = quiz.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const percent = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 shadow-2xl text-center border-white/50"
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 font-medium mb-10">Your response has been securely recorded.</p>
          
          <div className="bg-slate-50/80 backdrop-blur-sm p-10 rounded-[32px] mb-10 border border-slate-100 shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Final Score</p>
            <h3 className="text-7xl font-black text-indigo-600 mb-4">{percent}%</h3>
            <div className="flex justify-center space-x-2">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
                {score} / {quiz.questions.length} Points
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/student')}
            className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* Warning Overlay */}
      <AnimatePresence>
        {showWarningModal && lastViolation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
          >
            <div className="bg-red-600 text-white p-6 rounded-3xl shadow-2xl flex items-center space-x-4 border-4 border-white">
              <AlertTriangle className="w-10 h-10 shrink-0" />
              <div>
                <p className="font-black text-lg uppercase tracking-tight">Warning {warningCount}/3</p>
                <p className="text-sm font-bold opacity-90">{lastViolation.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Suspicious Activity Detected</h3>
              <p className="text-slate-500 mb-8 font-medium">
                You attempted to switch tabs or move away from the exam screen. This is a violation of exam rules.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                  Continue Exam
                </button>
                <button
                  onClick={() => navigate('/student')}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Exit & Abandon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Distraction-Free Header */}
      <div className="sticky top-2 z-40 mb-10">
        <div className="glass-card px-8 py-5 shadow-xl border-white/60 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-12 bg-slate-900 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-lg">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 truncate max-w-sm">{quiz.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Proctored Session</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warnings: {warningCount}/3</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 transition-colors ${timeLeft < 60 ? 'border-red-200 bg-red-50 text-red-600' : 'border-indigo-100 bg-indigo-50 text-indigo-600'}`}>
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-mono text-xl font-black">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => { if(window.confirm('Warning: Final submission cannot be undone. Proceed?')) handleSubmit(); }}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Finish Exam
            </button>
          </div>
        </div>
        <div className="mt-4 px-2">
          <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Grid (Left Panel) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="glass-card p-6 border-white/60 sticky top-32">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Question Navigator</p>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-10 rounded-xl font-black text-xs transition-all ${
                    i === currentIdx 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : answers[q.id] !== undefined
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 mr-2" />
                AI Monitoring Active
              </div>
              <div className="flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                <Camera className="w-4 h-4 mr-2" />
                Camera Stream Live
              </div>
            </div>
          </div>
        </div>

        {/* Question Area (Right Panel) */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-10 shadow-2xl border-white/60 min-h-[500px] flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Item {currentIdx + 1}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(quiz.questions.length)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIdx ? 'bg-indigo-600 scale-125' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-12">
                  {currentQuestion.text}
                </h2>
                
                <div className="grid grid-cols-1 gap-5">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [currentQuestion.id]: i })}
                      className={`flex items-center w-full p-6 rounded-[24px] border-2 transition-all text-left group ${
                        answers[currentQuestion.id] === i 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100/50' 
                        : 'border-slate-50 hover:border-slate-200 bg-white/50 text-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black mr-6 shrink-0 transition-all ${
                        answers[currentQuestion.id] === i ? 'bg-indigo-600 text-white rotate-6' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-xl">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-100/50">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="flex items-center space-x-2 px-8 py-4 rounded-2xl font-black text-slate-400 disabled:opacity-0 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    if (currentIdx < quiz.questions.length - 1) {
                      setCurrentIdx(prev => prev + 1);
                    } else {
                      if(window.confirm('Finish quiz and submit?')) handleSubmit();
                    }
                  }}
                  className="flex items-center space-x-2 px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                >
                  <span>{currentIdx === quiz.questions.length - 1 ? 'Finish Exam' : 'Next Item'}</span>
                  {currentIdx !== quiz.questions.length - 1 && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
