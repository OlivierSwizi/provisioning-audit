import { createSelector, createSlice } from "@reduxjs/toolkit";
import apiFactory from "../api";
import { getAccessToken, getUser } from "@/oidc";

export const parseRole = (roleString) => {
  const regex = /^([a-z]*)(-([a-z]*))?\.(.*)\.(.*)\.(.*)$/;

  const match = regex.exec(roleString);
  if (!match) return null;
  const [, role, , level, tenant, env, scope] = match;
  return { role, level, tenant, env, scope };
};

const initialState = {
  env: null,
  tenant: null,

  initialized: false,
  ready: false,
  authenticated: false,

  displayName: undefined,
  email: undefined,
  access: {},
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    getEnvConfig: (state, action) => {
      state.env = action.payload.environment;
      state.tenant = action.payload.tenant;
    },
    initialized: (state) => {
      state.initialized = true;
    },
    authenticationSuccess: (state, action) => {
      state.ready = true;
      state.authenticated = true;
      state.displayName = action.payload.profile.name;
      state.email = action.payload.profile.email;
      state.access = action.payload.access;
    },

    hasDisconnect: () => {
      return { ...initialState, initialized: true, ready: true };
    },
  },
});

export const API = createSelector(
  (state) => state.apps.selectedApp?.id,
  (state) => state.ui.locale,
  () => getAccessToken(),
  (appId, locale, token) => apiFactory(appId, locale, token),
);

export const { getEnvConfig, authenticationSuccess, hasDisconnect } = slice.actions;

export const postAuthent = () => async (dispatch, getState) => {
  const config = await API(getState()).apps.getEnvConfig();
  const access = await API(getState()).apps.getUserAccess();

  const userInfo = getUser();

  await dispatch(getEnvConfig(config));
  await dispatch(authenticationSuccess({ ...userInfo, access }));
};

export const postDisconnect = () => async (dispatch) => {
  await dispatch(hasDisconnect({}));
};

export default slice.reducer;
