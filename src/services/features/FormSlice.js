import { createSelector, createSlice, createAsyncThunk as thunk } from "@reduxjs/toolkit";
import { API } from "./AuthSlice";
import { partition } from "ramda";
import dayjs from "dayjs";

const SLICE_NAME = "form";
const INITIAL_STATE = {
  forms: [],
};

/*
|--------------------------------------------------------------------------
| Async Chunks
|--------------------------------------------------------------------------
*/

const EXTRA_REDUCERS = {};

export const listForms = thunk(`${SLICE_NAME}/listForms`, async (_, { getState }) => {
  const forms = await API(getState()).form.list();
  return forms;
});
EXTRA_REDUCERS[listForms.fulfilled] = (state, action) => {
  state.forms = action.payload;
};

export const createForm = thunk(`${SLICE_NAME}/createForm`, async (data, { getState }) => {
  await API(getState()).form.create(data);
});

export const updateForm = thunk(`${SLICE_NAME}/updateForm`, async (data, { getState }) => {
  const { id, ...rest } = data;
  await API(getState()).form.update(id, rest);
});

export const deleteForms = thunk(`${SLICE_NAME}/deleteForms`, async (ids, { getState }) => {
  await API(getState()).form.delete(ids);
});

const slice = createSlice({
  name: SLICE_NAME,
  initialState: INITIAL_STATE,
  extraReducers: (builder) => {
    Object.entries(EXTRA_REDUCERS).forEach(([action, reducer]) => {
      builder.addCase(action, reducer);
    });
  },
});

// returns [runningForms, archivedForms]
export const groupedForms = createSelector(
  (state) => state.form.forms,
  (forms) => partition((form) => !form.endDate || dayjs(form.endDate).isAfter(dayjs()), forms),
);

export default slice.reducer;
