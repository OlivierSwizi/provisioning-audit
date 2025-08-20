import { createSlice } from "@reduxjs/toolkit";
import { API } from "./AuthSlice";
import { message } from "antd";
import logger from "@/logger";

const initialState = {
  filter: "",
};

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    usersFilterUpdated: (state, action) => {
      state.filter = action.payload.filter;
    },
  },
});

// export const {} = slice.actions;

const { usersFilterUpdated } = slice.actions;

export const updateUserFilter = (filter) => async (dispatch) => {
  dispatch(usersFilterUpdated({ filter }));
};

export const resetUsers = () => async (dispatch) => {
  dispatch(usersFilterUpdated({ filter: "" }));
};

export const searchUsers = (filter, page, pageSize) => async (dispatch, getState) => {
  try {
    return await API(getState()).users.listUsers(page, pageSize, filter);
  } catch (error) {
    logger.error("Failed to load users", error);
    message.error("Failed to load users");
    return { total: 0, items: [] };
  }
};

export const createUser = (user) => async (dispatch, getState) => {
  return await API(getState()).users.createUser(user);
};

export const updateUserAccess =
  (userId, siteId, accessCode, expiresAt, isPresent, presenceExpirationDate) =>
  async (dispatch, getState) => {
    return await API(getState()).users.updateUserAccess(
      userId,
      siteId,
      accessCode,
      expiresAt,
      isPresent,
      presenceExpirationDate,
    );
  };

export const enableUsers = (userIds, enable) => async (dispatch, getState) => {
  return await API(getState()).users.enableUsers(userIds, enable);
};

export const removeUserAccess = (userId, siteId) => async (dispatch, getState) => {
  return await API(getState()).users.removeUserAccess(userId, siteId);
};

export const getUser = (userId) => async (dispatch, getState) => {
  const user = await API(getState()).users.getUserDetails(userId);
  const access = await API(getState()).users.getUserAccess(userId);
  return {
    ...user,
    access: access,
  };
};

export const updateUserDetails = (userId, userInfo) => async (dispatch, getState) => {
  return await API(getState()).users.updateUserDetails(userId, userInfo);
};

export const removeSelectedUserFromGroup = (groupId, userId) => async (dispatch, getState) => {
  return await API(getState()).groups.removeUsersFromGroup(groupId, userId);
};

export default slice.reducer;
