import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTranslation } from '../contexts/I18nContext';

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          <span className="text-sm text-zinc-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#71717a 1px, transparent 1px), linear-gradient(90deg, #71717a 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-[380px] space-y-8 relative z-10 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <Activity className="w-6 h-6 text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Allocator Protocol
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-[#111] text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-ring"
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.98C4.01 20.55 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.13C5.66 13.47 5.53 12.75 5.53 12C5.53 11.25 5.66 10.53 5.88 9.87V7.02H2.21C1.46 8.52 1 10.21 1 12C1 13.79 1.46 15.48 2.21 16.98L5.88 14.13Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.35 3.87C17.45 2.09 14.97 1 12 1C7.7 1 4.01 3.45 2.21 7.02L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            {t('auth.google')}
          </button>
        </div>

        <div className="text-center text-xs text-zinc-400 font-medium uppercase tracking-wider">
          100% Free &amp; Open Source
        </div>
      </div>
    </div>
  );
}
