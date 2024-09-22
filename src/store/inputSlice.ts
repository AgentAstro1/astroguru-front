// src/store/inputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
  values: {
    [key: string]: string;
  };
  errors: {
    [key: string]: string;
  };
}

const initialState: InputState = {
  values: {},
  errors: {},
};

const inputSlice = createSlice({
  name: 'inputs',
  initialState,
  reducers: {
    updateInput(state, action: PayloadAction<{ key: string; value: string }>) {
      state.values[action.payload.key] = action.payload.value;
    },
    setInputError(state, action: PayloadAction<{ key: string; error: string }>) {
      state.errors[action.payload.key] = action.payload.error;
    },
    clearInputError(state, action: PayloadAction<{ key: string }>) {
      delete state.errors[action.payload.key];
    },
  },
});

export const { updateInput, setInputError, clearInputError } = inputSlice.actions;
export default inputSlice.reducer;
