import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLive: true,
  isSelection: false,
  rangeStart: null,
  rangeEnd: null,
  stretchRange: null,
};


export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    changeStatusLive: state => {
      state.isLive = !state.isLive;
      state.rangeStart = null;
      state.rangeEnd = null;
    },
    setStatusLiveOn: state => {
      state.isLive = true;
      state.rangeStart = null;
      state.rangeEnd = null;
    },
    setStatusLiveOff: state => {
      state.isLive = false;
    },
    setStatusSelectionOn: state => {
      state.isSelection = true;
    },
    setStatusSelectionOff: state => {
      state.isSelection = false;
      state.stretchRange = null;
    },
    setStatusRangeStart: (state, action) => {
      state.rangeStart = action.payload;
    },
    setStatusRangeEnd: (state, action) => {
      state.rangeEnd = action.payload;
    },
    statusRangeClear: state => {
      state.rangeStart = null;
      state.rangeEnd = null;
    },
    setStatusStretchRange: (state, action) => {
      state.stretchRange = action.payload;
    },
  },
});

export const STATUS = {
  STRETCH_RANGE_START: "start",
  STRETCH_RANGE_END: "end",
};

export const {
  changeStatusLive,
  setStatusLiveOn,
  setStatusLiveOff,
  setStatusSelectionOn,
  setStatusSelectionOff,
  setStatusRangeStart,
  setStatusRangeEnd,
  statusRangeClear,
  setStatusStretchRange,
} = statusSlice.actions;

export default statusSlice.reducer;
