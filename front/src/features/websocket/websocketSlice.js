import { createSlice } from '@reduxjs/toolkit';

const initialState = [];
const ONE_DAY = 90001; // 1 day + 1 hour + 1 sec in seconds

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    addWebsocketData: (state, { payload }) => {
      if (payload?.timestamp > state.at(-1)?.timestamp + ONE_DAY) {
        state.pop();
      }
      state.unshift(payload);
    },
  },
});

export const { addWebsocketData } = websocketSlice.actions;

export default websocketSlice.reducer;
