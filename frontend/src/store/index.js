import { configureStore } from '@reduxjs/toolkit';
import needsReducer from './needsSlice';
import volunteerReducer from './volunteerSlice';

export const store = configureStore({
  reducer: {
    needs: needsReducer,
    volunteers: volunteerReducer,
  },
});

export default store;
