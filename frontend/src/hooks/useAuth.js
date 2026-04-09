import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider, hasConfig } from '../services/firebase';

export default function useAuth() {
  // In demo mode (no Firebase config), auto-authenticate with a mock user
  const [user, setUser] = useState(hasConfig ? null : { 
    displayName: 'Demo User', 
    email: 'demo@allocator.dev',
    photoURL: null,
    uid: 'demo-001'
  });
  const [loading, setLoading] = useState(hasConfig);

  useEffect(() => {
    if (!auth) return; // No Firebase — already in demo mode
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function signIn() {
    if (!auth || !googleProvider) {
      console.warn('[Auth] Firebase not configured — using demo mode');
      setUser({ displayName: 'Demo User', email: 'demo@allocator.dev', photoURL: null, uid: 'demo-001' });
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('[Auth] Sign-in failed:', e.message);
      throw e;
    }
  }

  async function signOut() {
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('[Auth] Sign-out failed:', e.message);
    }
  }

  return { user, loading, signIn, signOut };
}
