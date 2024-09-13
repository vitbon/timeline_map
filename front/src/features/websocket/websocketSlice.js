import { createSlice } from '@reduxjs/toolkit';

const initialState = [];
const ONE_DAY = 86430; // one day and 30 seconds in seconds

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
