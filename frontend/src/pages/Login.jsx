import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) return <div className="flex h-screen items-center justify-center slate-800">Loading...</div>;

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white shadow-sm rounded-lg flex flex-col items-center border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Resource Allocator</h1>
        <p className="text-slate-600 mb-8 font-medium">Connecting needs with help</p>
        <button 
          onClick={signIn}
          className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded hover:bg-teal-700 transition shadow-sm"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
