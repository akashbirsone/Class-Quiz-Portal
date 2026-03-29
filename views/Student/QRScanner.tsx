
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  ShieldAlert, 
  Zap, 
  Keyboard, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCcw,
  Loader2,
  MoreVertical,
  Check
} from 'lucide-react';

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showCameraList, setShowCameraList] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize and get cameras
  useEffect(() => {
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        // Check for available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          await startScanning(backCamera ? backCamera.id : devices[0].id);
        } else {
          setError("No camera detected on this device.");
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError("Camera access was denied or failed. Please check your browser permissions.");
        setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Stop error:", e);
      }
    }
  };

  const startScanning = async (cameraId: string) => {
    if (!scannerRef.current) return;
    
    setIsInitializing(true);
    setError(null);
    setCurrentCameraId(cameraId);
    setShowCameraList(false);

    try {
      await stopScanner();
      
      const config = { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };
      
      await scannerRef.current.start(
        cameraId,
        config,
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => { /* frame ignored */ }
      );
      
      setIsScanning(true);
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Start scanning error:", err);
      setError("Failed to start camera. It might be used by another application.");
      setIsInitializing(false);
    }
  };

  const handleSuccess = (code: string) => {
    if (isSuccess) return;
    setIsSuccess(true);
    stopScanner();

    // Haptic feedback simulation or just visual
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }

    setTimeout(() => {
      navigate(`/quiz/${code}`);
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSuccess(manualCode.trim());
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center relative overflow-hidden bg-slate-50/50">
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10 p-4"
      >
        <button 
          onClick={() => navigate('/student')}
          className="mb-8 flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm transition-all group px-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="glass-card shadow-2xl shadow-indigo-200/40 relative overflow-hidden backdrop-blur-xl border border-white/60">
          <div className="p-8 text-center border-b border-white/40">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Exam Entry</h2>
            <p className="text-slate-500 font-medium mt-1">Scan QR Code for instant authorization</p>
          </div>

          <div className="p-8">
            <div className="relative group">
              {/* Custom Viewfinder Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="w-[250px] h-[250px] relative">
                  {/* Glowing Corners */}
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -left-1 w-14 h-14 border-t-4 border-l-4 border-indigo-600 rounded-tl-2xl shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-14 h-14 border-t-4 border-r-4 border-indigo-600 rounded-tr-2xl shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -left-1 w-14 h-14 border-b-4 border-l-4 border-indigo-600 rounded-bl-2xl shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-14 h-14 border-b-4 border-r-4 border-indigo-600 rounded-br-2xl shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  />
                  
                  {/* Laser Line Animation */}
                  {!isSuccess && isScanning && !isInitializing && (
                    <motion.div 
                      animate={{ top: ['5%', '95%', '5%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-2 right-2 h-[2px] bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.8),0_0_10px_rgba(79,70,229,1)] z-30 opacity-70"
                    />
                  )}
                </div>
              </div>

              {/* Camera Feed Container */}
              <div 
                className="w-full aspect-square rounded-[32px] overflow-hidden bg-slate-900 border-8 border-slate-50/50 shadow-inner relative z-10"
              >
                <div id="qr-reader" className="w-full h-full object-cover"></div>
                
                {/* Initializing State */}
                <AnimatePresence>
                  {isInitializing && !error && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md z-40 text-white"
                    >
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Initializing Optical Feed</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-40 p-10 text-center"
                    >
                      <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
                      <h3 className="text-white font-black text-lg mb-2">Camera Unavailable</h3>
                      <p className="text-red-200 text-sm font-medium leading-relaxed">
                        {error}
                      </p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-white text-red-900 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Success State */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-indigo-600/90 z-50 flex flex-col items-center justify-center text-white p-6 backdrop-blur-md"
                    >
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="p-6 bg-white/20 rounded-full mb-6 border-4 border-white/30"
                      >
                        <CheckCircle2 className="w-16 h-16" />
                      </motion.div>
                      <h3 className="text-3xl font-black mb-2">Verified!</h3>
                      <p className="font-bold text-indigo-100 uppercase tracking-widest text-xs">Entering Exam Hall...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Camera Selection Controls */}
              {cameras.length > 0 && isScanning && !isSuccess && (
                <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end space-y-2">
                  <AnimatePresence>
                    {showCameraList && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-2 mb-2 w-56 overflow-hidden"
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-100 mb-1">
                          Select Camera
                        </p>
                        <div className="space-y-1">
                          {cameras.map((camera) => (
                            <button
                              key={camera.id}
                              onClick={() => startScanning(camera.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                currentCameraId === camera.id
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                              }`}
                            >
                              <span className="truncate mr-2">{camera.label || `Camera ${cameras.indexOf(camera) + 1}`}</span>
                              {currentCameraId === camera.id && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setShowCameraList(!showCameraList)}
                    className={`p-4 rounded-full transition-all shadow-xl backdrop-blur-md border ${
                      showCameraList 
                        ? 'bg-indigo-600 text-white border-indigo-400' 
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/40'
                    } active:scale-90`}
                    title="Camera Settings"
                  >
                    <RefreshCcw className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
              <div className="flex items-center space-x-2 text-indigo-600 mb-6">
                <Zap className="w-4 h-4 fill-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Advanced Scanning Logic Active</span>
              </div>

              <AnimatePresence mode="wait">
                {!showManual ? (
                  <motion.button
                    key="btn-manual"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowManual(true)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors py-2"
                  >
                    <Keyboard className="w-4 h-4" />
                    <span>Enter Manual Exam ID</span>
                  </motion.button>
                ) : (
                  <motion.form
                    key="form-manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleManualSubmit}
                    className="w-full space-y-4"
                  >
                    <div className="relative">
                      <input
                        autoFocus
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="e.g. QUIZ-24-CS-01"
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-mono text-center uppercase font-black text-lg tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!manualCode.trim()}
                      className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <span>Authorize Entry</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowManual(false)}
                      className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest pt-2 hover:text-slate-600"
                    >
                      Back to Camera
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] px-8 leading-relaxed">
          The scanner identifies secure encrypted tokens <br/>
          unique to your academic year.
        </p>
      </motion.div>
    </div>
  );
};

export default QRScanner;
