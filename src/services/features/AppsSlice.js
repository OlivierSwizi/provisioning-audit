import logger from "@/logger";
import { createSlice } from "@reduxjs/toolkit";
import { API } from "./AuthSlice";
import { resetUsers } from "./UsersSlice";
import { resetGroups } from "./GroupsSlice";
import { resetCalendars } from "./CalendarsSlice";

const initialState = {
  appList: [],
  selectedApp: null,
  siteList: [],
  sectorList: {},
  selectedGroupId: undefined,
  isUserGroupAdmin: false,
  isIMActive: false,
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppList: (state, action) => {
      state.appList = action.payload;
    },
    setSelectedApp: (state, action) => {
      state.selectedApp = action.payload.selectedApp;
      state.siteList = (action.payload.siteList || []).sort((a, b) =>
        (a.label || "").localeCompare(b.label),
      );
      state.sectorList = action.payload.sectorList;
      state.isUserGroupAdmin = action.payload.isUserGroupAdmin;
      state.isIMActive = action.payload.isIMActive;
    },
    setSelectedGroupId: (state, action) => {
      state.selectedGroupId = action.payload;
    },
  },
});

export const { setSelectedGroupId } = slice.actions;

/**
 * Thunks
 */

const { setAppList, setSelectedApp } = slice.actions;

//Loading application list
export const loadAppList = () => async (dispatch, getState) => {
  try {
    const appListResult = await API(getState()).apps.listApps();
    dispatch(setAppList(appListResult.sort((a, b) => a.name.localeCompare(b.name))));
  } catch (error) {
    logger.error("Failed to load apps", error);
    dispatch(setAppList([]));
  }
};

//loading application details
export const selectApp = (appId) => async (dispatch, getState) => {
  try {
    const { access } = getState().auth;

    const selectedApp = await API(getState()).apps.selectedApp(appId);
    const siteList = await API(getState()).apps.getAppSites(appId);
    const sectorList = await API(getState()).apps.getAppSectors(appId);

    const isUserGroupAdmin =
      access[selectedApp.id]?.usersgroups === "admin" ||
      access?.all?.usersgroups === "admin" ||
      access.superAdmin;

    dispatch(
      setSelectedApp({
        selectedApp,
        siteList,
        sectorList,
        isUserGroupAdmin,
        isIMActive: selectedApp.isIMActive,
      }),
    );
  } catch (error) {
    logger.error("Failed to load app details", error);
    throw error;
  }
  dispatch(resetUsers());
  dispatch(resetGroups());
  dispatch(resetCalendars());
};

export const exportSPAAS = (filters) => async (dispatch, getState) => {
  try {
    await API(getState()).exports.spaas(filters);
  } catch (error) {
    logger.error("Failed to export SPAAS", error);
    throw error;
  }
};

export default slice.reducer;
