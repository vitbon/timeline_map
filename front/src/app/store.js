import { configureStore } from '@reduxjs/toolkit';
import statusReducer from '../features/slices/status';
import websocketReducer from '../features/slices/websocket';

export const store = configureStore({
  reducer: {
    status: statusReducer,
    websocket: websocketReducer,
  },
});
