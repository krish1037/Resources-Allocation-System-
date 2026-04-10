import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Sidebar from './components/Sidebar';

import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import NeedsMap   from './pages/NeedsMap';
import Volunteers from './pages/Volunteers';
import Ingest     from './pages/Ingest';
import Analytics  from './pages/Analytics';
import { firebaseError } from './services/firebase';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (firebaseError) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', 
                    height:'100vh', padding: 20, textAlign: 'center', backgroundColor: '#FEF2F2' }}>
        <h1 style={{ color: '#DC2626', marginBottom: 12 }}>Firebase Configuration Error</h1>
        <p style={{ color: '#7F1D1D', maxWidth: 500 }}>{firebaseError}</p>
        <p style={{ marginTop: 20, fontSize: 13, color: '#4B5563' }}>Please check your .env variables and Firebase project settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                    height:'100vh', color:'var(--color-text-secondary)', fontSize:14 }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <main style={{ flex:1, overflow:'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/map"        element={<NeedsMap />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/ingest"     element={<Ingest />} />
        <Route path="/analytics"  element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
