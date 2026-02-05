import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ipcService } from '../../services/ipc';

export type ConnectionState = 'connected' | 'reconnecting' | 'offline';

interface ConnectionStateType {
  status: ConnectionState;
}

const initialState: ConnectionStateType = {
  status: 'reconnecting',
};

export const getConnectionStatus = createAsyncThunk(
  'connection/getStatus',
  async () => {
    const result = await ipcService.getConnectionStatus();
    return result.status as ConnectionState;
  }
);

export const simulateConnectionDrop = createAsyncThunk(
  'connection/simulateDrop',
  async () => {
    await ipcService.simulateConnectionDrop();
  }
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionState>) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConnectionStatus.fulfilled, (state, action) => {
      state.status = action.payload;
    });
  },
});

export const { setConnectionStatus } = connectionSlice.actions;
export default connectionSlice.reducer;
