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
          text: 'Checking...',
          badgeClass: 'border-slate-700 text-slate-400',
        };
      case 'active':
        return {
          dotClass: 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          text: 'Database Online',
          badgeClass: 'border-emerald-900/30 text-emerald-400',
        };
      case 'offline':
        return {
          dotClass: 'bg-rose-500',
          text: 'Database Offline',
          badgeClass: 'border-rose-900/30 text-rose-400',
        };
    }
  };

  const { dotClass, text, badgeClass } = getStatusStyles();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border text-xs font-medium transition-all duration-300 ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span>{text}</span>
    </div>
  );
};

export default DatabaseStatus;
