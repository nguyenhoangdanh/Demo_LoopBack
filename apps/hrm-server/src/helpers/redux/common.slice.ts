import { createSlice } from '@reduxjs/toolkit';

export interface CommonState {
  name: string;
}

const initialState: CommonState = {
  name: '',
};

export const slice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setName: (state, action) => {
      const { name = '' } = action?.payload || {};
      state.name = name;
    },
  },
});

export const { setName } = slice.actions;

export default slice.reducer;
