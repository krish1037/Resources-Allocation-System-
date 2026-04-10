import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export default function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function signIn() {
    if (!auth) {
      console.error('[Auth] Cannot sign in: Firebase not initialized');
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
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('[Auth] Sign-out failed:', e.message);
    }
  }

  return { user, loading, signIn, signOut };
}
