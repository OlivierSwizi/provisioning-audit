import logger from "@/logger";
import { createSlice } from "@reduxjs/toolkit";
import { API } from "./AuthSlice";

const initialState = {
  userList: [],
  config: {},
};

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    updateUserList: (state, action) => {
      state.userList = action.payload;
    },
    updateConfig: (state, action) => {
      state.config = action.payload;
    },
  },
});

export const { updateUserList, updateConfig } = slice.actions;

//Loading user list
export const loadUserList = () => async (dispatch, getState) => {
  try {
    const appListResult = await API(getState()).admin.listUsers();
    dispatch(updateUserList(appListResult));
  } catch (error) {
    logger.error("Failed to load users", error);
    throw error;
  }
};

//Loading config
export const loadConfig = () => async (dispatch, getState) => {
  try {
    const configResult = await API(getState()).admin.loadConfig();
    dispatch(updateConfig(configResult));
  } catch (error) {
    logger.error("Failed to load config", error);
    throw error;
  }
};

//Loading userRole
export const loadUserPermissions = (email) => async (dispatch, getState) => {
  return await API(getState()).admin.loadUserPermissions(email);
};

//Loading userRole
export const saveUserPermissions = (email, data) => async (dispatch, getState) => {
  return await API(getState()).admin.saveUserPermissions(email, data);
};

//Create a user
export const createUser =
  ({ firstName, lastName, email }) =>
  async (dispatch, getState) => {
    await API(getState()).admin.createUser({
      firstName,
      lastName,
      email,
    });
    dispatch(loadUserList());
  };

export default slice.reducer;
