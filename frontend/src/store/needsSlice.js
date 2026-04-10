import { createSlice, createSelector } from '@reduxjs/toolkit';

const needsSlice = createSlice({
  name: 'needs',
  initialState: { items: [] },
  reducers: {
    setNeeds: (state, action) => { state.items = action.payload; },
  },
});

export const { setNeeds } = needsSlice.actions;

export const selectAllNeeds = state => state.needs.items;

export const selectOpenNeeds = createSelector(
    [selectAllNeeds],
    (items) => items.filter(n => n.status === 'open')
);

export const selectActiveNeeds = createSelector(
    [selectAllNeeds],
    (items) => items.filter(n => n.status === 'open' || n.status === 'assigned')
);

export default needsSlice.reducer;
