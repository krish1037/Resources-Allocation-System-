import { createSlice } from '@reduxjs/toolkit';

const volunteerSlice = createSlice({
  name: 'volunteers',
  initialState: { items: [] },
  reducers: {
    setVolunteers: (state, action) => { state.items = action.payload; },
  },
});

export const { setVolunteers } = volunteerSlice.actions;
export const selectAllVolunteers = state => state.volunteers.items;
export const selectAvailableVolunteers = state => state.volunteers.items.filter(v => v.availability === true);
export default volunteerSlice.reducer;
