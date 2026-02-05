import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedChatId: number | null;
}

const initialState: UIState = {
  selectedChatId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectChat: (state, action: PayloadAction<number | null>) => {
      state.selectedChatId = action.payload;
    },
  },
});

export const { selectChat } = uiSlice.actions;
export default uiSlice.reducer;
