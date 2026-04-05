
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService, ContentPart } from '../../geminiService';
import { Storage } from '../../storage';
import { Question, Difficulty, Quiz } from '../../types';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Calendar,
  BrainCircuit,
  FileText,
  Camera,
  Type as TypeIcon,
  Upload,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileUp,
  Files,
  LayoutGrid,
  Zap,
  RotateCcw,
  PlusCircle
} from 'lucide-react';

interface FileItem {
  id: string;
  file: File;
  preview?: string;
  base64?: string;
}

interface QuizFormProps {
  config: {
    title: string;
    description: string;
    academicYear: string;
    semester: string;
    durationMinutes: number;
    questionCount: number;
    difficulty: Difficulty;
    subject: string;
  };
  onChange: (config: any) => void;
  onGenerate: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ config, onChange, onGenerate }) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-4 md:p-8 border-white/60 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-indigo-600 mb-4">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Assessment Configuration</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <BookOpen className="w-3 h-3 mr-2 text-indigo-400" />
              Examination Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onChange({...config, title: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm shadow-inner"
              placeholder="e.g. Advanced Thermodynamics Midterm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <LayoutGrid className="w-3 h-3 mr-2 text-indigo-400" />
              Subject / Course
            </label>
            <input
              type="text"
              value={config.subject}
              onChange={(e) => onChange({...config, subject: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm shadow-inner"
              placeholder="e.g. Physics, Mathematics"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <FileText className="w-3 h-3 mr-2 text-indigo-400" />
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => onChange({...config, description: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm resize-none h-24 shadow-inner"
              placeholder="Provide context or instructions for students..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-indigo-400" />
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={config.academicYear}
                  onChange={(e) => {
                    const year = e.target.value;
                    let semester = config.semester;
                    if (year === '1st Year') semester = 'Semester 1';
                    else if (year === '2nd Year') semester = 'Semester 3';
                    else if (year === '3rd Year') semester = 'Semester 5';
                    else if (year === '4th Year') semester = 'Semester 7';
                    onChange({...config, academicYear: year, semester});
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm appearance-none shadow-inner"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <LayoutGrid className="w-3 h-3 mr-2 text-indigo-400" />
                Semester
              </label>
              <div className="relative">
                <select
                  value={config.semester}
                  onChange={(e) => onChange({...config, semester: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm appearance-none shadow-inner"
                >
                  {config.academicYear === '1st Year' && (
                    <>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </>
                  )}
                  {config.academicYear === '2nd Year' && (
                    <>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                    </>
                  )}
                  {config.academicYear === '3rd Year' && (
                    <>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                    </>
                  )}
                  {config.academicYear === '4th Year' && (
                    <>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Clock className="w-3 h-3 mr-2 text-indigo-400" />
                Duration (1-30 Min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.durationMinutes}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 0;
                  if (val > 30) val = 30;
                  onChange({...config, durationMinutes: val});
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-900 text-sm shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Files className="w-3 h-3 mr-2 text-indigo-400" />
                Questions: {config.questionCount}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={config.questionCount}
                onChange={(e) => onChange({...config, questionCount: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-4"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-2 text-indigo-400" />
              Complexity Level
            </label>
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange({...config, difficulty: level})}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.difficulty === level ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<'text' | 'document' | 'image'>('text');
  
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    subject: '',
    description: '',
    academicYear: '1st Year',
    semester: 'Semester 1',
    durationMinutes: 30,
    questionCount: 10,
    difficulty: 'Medium' as Difficulty,
    sourceText: ''
  });

  const [files, setFiles] = useState<FileItem[]>([]);
  const [images, setImages] = useState<FileItem[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedQuestions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedQuestions(next);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'img') => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newItems: FileItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const base64 = await fileToBase64(file);
      const item: FileItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        base64,
        preview: type === 'img' ? URL.createObjectURL(file) : undefined
      };
      newItems.push(item);
    }

    if (type === 'doc') setFiles([...files, ...newItems]);
    else setImages([...images, ...newItems]);
    
    e.target.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    const parts: ContentPart[] = [];
    if (quizConfig.sourceText.trim()) parts.push({ text: quizConfig.sourceText });
    images.forEach(img => {
      if (img.base64) {
        let mimeType = img.file.type || 'image/jpeg';
        parts.push({ inlineData: { mimeType, data: img.base64 } });
      }
    });
    files.forEach(doc => {
      if (doc.base64) {
        let mimeType = doc.file.type;
        if (!mimeType) {
          if (doc.file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
          else mimeType = 'text/plain';
        }
        parts.push({ inlineData: { mimeType, data: doc.base64 } });
      }
    });

    if (parts.length === 0) {
      alert("Please provide source content (Text, PDF, or Photo) for AI generation.");
      return;
    }

    if (!quizConfig.title.trim()) {
      alert("Please enter an examination title.");
      return;
    }

    setLoading(true);
    setStatus('AI is analyzing source material...');
    
    try {
      const qs = await GeminiService.generateQuestions(
        parts,
        quizConfig.questionCount,
        quizConfig.difficulty,
        (current, total) => {
          setStatus(`Generating question ${current} of ${total}...`);
        }
      );
      
      if (!qs || qs.length === 0) {
        throw new Error("No questions were generated. Please provide more detailed source content.");
      }

      // Append generated questions to existing ones
      const newQs = [...generatedQuestions, ...qs];
      setGeneratedQuestions(newQs);
      setStep(2);
      setExpandedQuestions(new Set(newQs.slice(0, 3).map(q => q.id)));
    } catch (err: any) {
      console.error("Generation Error:", err);
      alert(err.message || "Generation failed. Please refine your content and try again.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleSave = async (status: 'draft' | 'published' = 'published') => {
    const user = Storage.getCurrentUser();
    if (!user) return;
    
    if (quizConfig.durationMinutes < 1 || quizConfig.durationMinutes > 30) {
      alert("Duration must be between 1 and 30 minutes.");
      return;
    }

    setLoading(true);
    setStatus('Saving examination...');

    try {
      const newQuiz: Quiz = {
        id: Math.random().toString(36).substring(2, 9),
        title: quizConfig.title || 'Untitled Assessment',
        subject: quizConfig.subject,
        description: quizConfig.description,
        academicYear: quizConfig.academicYear,
        semester: quizConfig.semester,
        questions: generatedQuestions,
        durationMinutes: quizConfig.durationMinutes,
        createdAt: Date.now(),
        adminId: user.id,
        active: true,
        status
      };
      await Storage.saveQuiz(newQuiz);
      navigate('/admin');
    } catch (err: any) {
      alert("Failed to save quiz: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const removeFile = (id: string, type: 'doc' | 'img') => {
    if (type === 'doc') setFiles(files.filter(f => f.id !== id));
    else setImages(images.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-[1200px] mx-auto py-8 px-4 md:px-8">
        <button 
          onClick={() => navigate('/admin')}
          className="mb-8 flex items-center text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors group px-4 md:px-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard Console
        </button>

        <header className="mb-12 px-4 md:px-0">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Examination Architect</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Engineer assessments using Gemini AI's multi-modal knowledge extraction.</p>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-20 shadow-2xl border-white/60 flex flex-col items-center justify-center text-center mx-auto max-w-2xl"
            >
              <div className="relative mb-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-[12px] border-indigo-50 border-t-indigo-600 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <BrainCircuit className="w-12 h-12 text-indigo-600" />
                </motion.div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Reasoning Engine Engaged</h3>
              <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">{status}</p>
            </motion.div>
          ) : step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 md:px-0"
            >
              <div className="lg:col-span-4 order-2 lg:order-1">
                <QuizForm 
                  config={quizConfig} 
                  onChange={setQuizConfig} 
                  onGenerate={handleGenerate} 
                />
              </div>

              <div className="lg:col-span-8 order-1 lg:order-2 flex justify-center">
                <div className="w-full max-w-[600px] glass-card shadow-2xl border-white/60 overflow-hidden flex flex-col">
                  <div className="flex bg-slate-100/50 border-b border-slate-200/50 overflow-x-auto custom-scrollbar">
                    {[
                      { id: 'text', label: 'Manual Text', icon: <TypeIcon className="w-4 h-4" /> },
                      { id: 'document', label: 'PDF / DOCS', icon: <FileText className="w-4 h-4" /> },
                      { id: 'image', label: 'Upload Photo', icon: <Camera className="w-4 h-4" /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveInputTab(tab.id as any)}
                        className={`flex-1 min-w-[120px] py-5 flex items-center justify-center space-x-3 font-black text-[10px] uppercase tracking-widest transition-all relative ${activeInputTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeInputTab === tab.id && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                      {activeInputTab === 'text' && (
                        <motion.div
                          key="tab-text"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col flex-1"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Topic Content</h4>
                            <button 
                              onClick={() => setQuizConfig({...quizConfig, sourceText: ''})}
                              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Clear Text
                            </button>
                          </div>
                          <textarea
                            value={quizConfig.sourceText}
                            onChange={(e) => setQuizConfig({...quizConfig, sourceText: e.target.value})}
                            className="w-full p-6 h-[400px] rounded-3xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-mono text-sm leading-relaxed resize-none shadow-inner"
                            placeholder="Paste lecture notes or text here..."
                          />
                        </motion.div>
                      )}

                      {activeInputTab === 'document' && (
                        <motion.div
                          key="tab-doc"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Knowledge Repository</h4>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/50'); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50'); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                              if(e.dataTransfer.files) {
                                const event = { target: { files: e.dataTransfer.files } } as any;
                                handleFileChange(event, 'doc');
                              }
                            }}
                            className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group shadow-inner"
                          >
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                              <FileUp className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">Upload Study Notes</h4>
                            <p className="text-slate-500 text-xs font-medium hidden md:block">Drag & drop PDF or TXT documents <br/> or click to browse.</p>
                            <p className="text-indigo-600 text-xs font-black md:hidden uppercase tracking-widest">Tap to Browse Files</p>
                            <input 
                              type="file" 
                              multiple 
                              accept=".pdf,.txt" 
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={(e) => handleFileChange(e, 'doc')}
                            />
                          </div>

                          <div className="space-y-3">
                            {files.map(f => (
                              <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <p className="font-bold text-slate-900 text-xs truncate">{f.file.name}</p>
                                </div>
                                <button onClick={() => removeFile(f.id, 'doc')} className="p-2 text-slate-300 hover:text-red-500">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeInputTab === 'image' && (
                        <motion.div
                          key="tab-img"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Analyze Visuals & Photos</h4>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Upload textbook photos for extraction.</p>
                          </div>
                          <div 
                            onClick={() => imageInputRef.current?.click()}
                            className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group shadow-inner"
                          >
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                              <Camera className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">Capture Material</h4>
                            <p className="text-slate-500 text-xs font-medium hidden md:block">Click to browse gallery or drag photos here.</p>
                            <p className="text-indigo-600 text-xs font-black md:hidden uppercase tracking-widest">Browse Gallery / Take Photo</p>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              capture="environment"
                              className="hidden" 
                              ref={imageInputRef}
                              onChange={(e) => handleFileChange(e, 'img')}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            {images.map(img => (
                              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                                <img src={img.preview} className="w-full h-full object-cover" alt="Source" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => removeFile(img.id, 'img')} className="p-2 bg-red-500 text-white rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="p-8 border-t border-slate-100/50 bg-slate-50/30 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {activeInputTab === 'text' ? `${quizConfig.sourceText.length} Chars` : activeInputTab === 'document' ? `${files.length} Files` : `${images.length} Photos`} Prepared
                    </div>
                    <button
                      onClick={handleGenerate}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all flex items-center space-x-2 shadow-xl active:scale-95"
                    >
                      <span>Proceed to AI Validation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 px-4 md:px-0"
            >
              <div className="glass-card p-4 md:p-8 border-indigo-100 bg-indigo-50/40 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                    <Files className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Validation Lab</h3>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">Reviewing {generatedQuestions.length} synthesized items.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button onClick={() => setStep(1)} className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 bg-white text-slate-600 font-black uppercase text-[10px] tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Modify</button>
                  <button onClick={() => handleSave('draft')} className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all">Draft</button>
                  <button onClick={() => handleSave('published')} className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Publish</button>
                </div>
              </div>

              <div className="space-y-6">
                {generatedQuestions.map((q, idx) => (
                  <motion.div 
                    key={q.id} 
                    className="glass-card shadow-xl border-white/60 overflow-hidden"
                  >
                    <div 
                      className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${expandedQuestions.has(q.id) ? 'bg-indigo-50/10' : ''}`}
                      onClick={() => toggleExpand(q.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shrink-0">{idx + 1}</span>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-2 md:truncate md:max-w-md">{q.text}</h4>
                      </div>
                      <div className="flex items-center justify-between md:justify-end space-x-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 ${q.difficulty === 'Hard' ? 'text-red-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>{q.difficulty}</span>
                        {expandedQuestions.has(q.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedQuestions.has(q.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100"
                        >
                          <div className="p-4 md:p-8 space-y-6 bg-white/40">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {q.options.map((opt, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex items-center space-x-4 ${i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${i === q.correctAnswer ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  <span className="font-bold text-sm">{opt}</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-medium text-indigo-800 leading-relaxed">
                              <span className="font-black uppercase tracking-widest text-[9px] block mb-1">AI Context:</span>
                              {q.explanation}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8 pb-12 space-x-4">
                <button 
                  onClick={() => handleSave('draft')} 
                  className="px-8 py-6 bg-slate-200 text-slate-700 rounded-[32px] font-black text-xl shadow-xl hover:bg-slate-300 transition-all flex items-center space-x-4"
                >
                  <span>Save as Draft</span>
                  <FileText className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleSave('published')} 
                  className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center space-x-4"
                >
                  <span>Publish Examination Session</span>
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateQuiz;
