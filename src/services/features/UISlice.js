import { createSelector, createSlice } from "@reduxjs/toolkit";
import { clamp } from "ramda";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

const initialState = {
  isLoading: 0, // use integer to allow multiple start/stop calls
  locale: "fr",
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startWorking: (state) => {
      state.isLoading = clamp(0, Infinity, state.isLoading + 1);
    },
    stopWorking: (state) => {
      state.isLoading = clamp(0, Infinity, state.isLoading - 1);
    },
  },
});

export const { startWorking, stopWorking } = slice.actions;
export default slice.reducer;

export const isLoading = createSelector(
  (state) => state.ui.isLoading,
  (isLoading) => isLoading > 0,
);

export const useWorkDispatch = () => {
  const dispatch = useDispatch();

  const workDispatch = useCallback(
    async (fn) => {
      try {
        await dispatch(startWorking());
        return await dispatch(fn);
      } finally {
        await dispatch(stopWorking());
      }
    },
    [dispatch],
  );

  return workDispatch;
};
