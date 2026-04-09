import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useDispatch } from 'react-redux';
import { setNeeds as setNeedsAction } from '../store/needsSlice';

export default function useNeeds() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
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
      
      dispatch(setNeedsAction(needsData));
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { needs, loading, error };
}
