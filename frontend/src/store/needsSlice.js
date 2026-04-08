import { createSlice } from '@reduxjs/toolkit';

const needsSlice = createSlice({
  name: 'needs',
  initialState: { data: [] },
  reducers: {
    // TODO: Add reducers for updating needs
  }
});

export const { actions: needsActions, reducer: needsReducer } = needsSlice;
