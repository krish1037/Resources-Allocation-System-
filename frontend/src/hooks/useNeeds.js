import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useDispatch } from 'react-redux';
import { needsActions } from '../store/needsSlice';

export default function useNeeds() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!db) {
      // Firestore not available — no data to load
      console.warn('[useNeeds] Firestore not configured — running with empty needs');
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'community_needs'),
      orderBy('priority_score', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const needsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNeeds(needsData);
      
      if (needsActions && needsActions.setNeeds) {
        dispatch(needsActions.setNeeds(needsData));
      }
      setLoading(false);
    }, (err) => {
      console.warn('[useNeeds] Snapshot error:', err.message);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { needs, loading, error };
}
