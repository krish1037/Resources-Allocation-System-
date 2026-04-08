import { createSlice } from '@reduxjs/toolkit';

const volunteerSlice = createSlice({
  name: 'volunteers',
  initialState: { data: [] },
  reducers: {
    setVolunteers: (state, action) => {
      state.data = action.payload;
    }
  }
});

export const { setVolunteers } = volunteerSlice.actions;

// Selectors
export const selectAllVolunteers = (state) => state.volunteers.data;
export const selectAvailableVolunteers = (state) => 
  state.volunteers.data.filter(v => v.availability === true);
export const selectVolunteerById = (state, id) => 
  state.volunteers.data.find(v => v.id === id);

export const { actions: volunteerActions, reducer: volunteerReducer } = volunteerSlice;
export default volunteerReducer;
