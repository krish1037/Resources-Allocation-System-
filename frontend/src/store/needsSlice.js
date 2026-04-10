import { createSlice } from '@reduxjs/toolkit';

const needsSlice = createSlice({
  name: 'needs',
  initialState: { items: [] },
  reducers: {
    setNeeds: (state, action) => { state.items = action.payload; },
  },
});

export const { setNeeds } = needsSlice.actions;
export const selectAllNeeds = state => state.needs.items;
export const selectOpenNeeds = state => state.needs.items.filter(n => n.status === 'open');
export default needsSlice.reducer;
