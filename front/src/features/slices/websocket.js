import { createSlice } from '@reduxjs/toolkit';

const initialState = [];
const ONE_DAY = 90001; // 1 day + 1 hour + 1 sec in seconds
const ONE_DAY_OBJECTS = 3001; // 1 day + 1 hour + 30 secs in objects

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
    setNewWebsocketArray: (state, { payload }) => {
      if (payload.length - ONE_DAY_OBJECTS > 0) {
        return [].concat(payload.slice(0, ONE_DAY_OBJECTS));
      } else {
        return payload;
      }
    },
  },
});

export const { addWebsocketData, setNewWebsocketArray } =
  websocketSlice.actions;

export default websocketSlice.reducer;
