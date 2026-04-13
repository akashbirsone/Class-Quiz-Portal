import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

type Status = 'connecting' | 'active' | 'offline';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<Status>('connecting');

  const checkConnection = useCallback(async () => {
    if (!window.navigator.onLine) {
      setStatus('offline');
      return;
    }

    setStatus('connecting');
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        console.error('Database connection error:', error);
        setStatus('offline');
      } else {
        setStatus('active');
      }
    } catch (err) {
      console.error('Unexpected error during connection check:', err);
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkConnection();

    const handleOnline = () => {
      console.log('Network online, re-checking database status...');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('Network offline');
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  const getStatusStyles = () => {
    switch (status) {
      case 'connecting':
        return {
          dotClass: 'bg-slate-400 animate-pulse',
          text: 'Establishing Secure Database Connection...',
          bannerClass: 'bg-slate-100 text-slate-500 border-b border-slate-200',
        };
      case 'active':
        return {
          dotClass: 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          text: 'Database Online: All Systems Operational',
          bannerClass: 'bg-emerald-500/10 text-emerald-600 border-b border-emerald-100',
        };
      case 'offline':
        return {
          dotClass: 'bg-rose-500 animate-ping',
          text: 'Database Offline: Please check your connection',
          bannerClass: 'bg-rose-500 text-white font-bold',
        };
    }
  };

  const { dotClass, text, bannerClass } = getStatusStyles();

  return (
    <div className={`w-full py-2 px-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${bannerClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{text}</span>
    </div>
  );
};

export default DatabaseStatus;
