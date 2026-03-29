
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Trophy, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    icon: <Sparkles className="w-12 h-12 text-indigo-600" />,
    subHeadline: "Smart Examination Hub",
    headline: "AI-Powered Examination Reinvented",
    description: "Upload your notes, generate smart MCQs with Gemini AI, and manage your entire class quiz lifecycle.",
    color: "from-indigo-500/20 to-blue-500/20"
  },
  {
    id: 2,
    icon: <BarChart3 className="w-12 h-12 text-indigo-600" />,
    subHeadline: "Analytics Engine",
    headline: "Track Progress Instantly",
    description: "Monitor student performance, track attempted vs. non-attempted status, and view detailed year-wise reports.",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 3,
    icon: <Trophy className="w-12 h-12 text-indigo-600" />,
    subHeadline: "Gamified Results",
    headline: "Rank & Reward",
    description: "Automatic evaluation and instant results. Students can view their exam history and see their position on the global leaderboard.",
    color: "from-purple-500/20 to-indigo-500/20"
  }
];

const Landing: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-200/30 blur-2xl"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[500px]">
        {/* Glassmorphism Card */}
        <div className="glass-card rounded-[32px] shadow-2xl shadow-indigo-200/40 overflow-hidden border border-white/40">
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon Container with Floating Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mb-8 shadow-inner`}
                >
                  {slides[currentSlide].icon}
                </motion.div>

                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-3 bg-indigo-50 px-3 py-1 rounded-full"
                >
                  {slides[currentSlide].subHeadline}
                </motion.span>

                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6"
                >
                  {slides[currentSlide].headline}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-500 text-lg leading-relaxed font-medium mb-10"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex justify-center items-center space-x-2 mb-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="group relative"
                >
                  <motion.div
                    animate={{
                      width: i === currentSlide ? 24 : 8,
                      backgroundColor: i === currentSlide ? "#4F46E5" : "#E2E8F0"
                    }}
                    className="h-2 rounded-full transition-colors duration-300"
                  />
                </button>
              ))}
            </div>

            {/* Main CTA Button */}
            <Link
              to="/login"
              className="group w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 overflow-hidden"
            >
              <span>GET STARTED</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </Link>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          Class Quiz Portal • Secured by Gemini AI
        </p>
      </div>
    </div>
  );
};

export default Landing;
