import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useDispatch } from 'react-redux';
import { setVolunteers } from '../store/volunteerSlice';

export default function useVolunteers(onlyAvailable = false) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volunteers, setLocalVolunteers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    let q;
    if (onlyAvailable) {
      q = query(
        collection(db, 'volunteers'),
        where('availability', '==', true),
        orderBy('name', 'asc')
      );
    } else {
      q = query(collection(db, 'volunteers'), orderBy('name', 'asc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocalVolunteers(data);
        dispatch(setVolunteers(data));
        setLoading(false);
      },
      (err) => {
        console.error('useVolunteers snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [onlyAvailable, dispatch]);

  return { volunteers, loading, error };
}
