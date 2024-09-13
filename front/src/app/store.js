import { configureStore } from '@reduxjs/toolkit';
import statusReducer from '../features/status/statusSlice';
import websocketReducer from '../features/websocket/websocketSlice';

export const store = configureStore({
  reducer: {
    status: statusReducer,
    websocket: websocketReducer,
  },
});
