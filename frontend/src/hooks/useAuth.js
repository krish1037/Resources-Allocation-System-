import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const isAuthenticated = !!user;

  return { user, isAuthenticated, loading, signIn, signOut };
}
