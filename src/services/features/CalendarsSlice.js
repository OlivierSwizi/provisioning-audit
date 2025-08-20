import logger from "@/logger";
import { createSlice } from "@reduxjs/toolkit";
import { API } from "./AuthSlice";
import helpers from "@/helpers";
import dayjs from "dayjs";

const getWeekWindow = (selectedDay) => {
  const start = dayjs(selectedDay).startOf("week").startOf("day");
  const end = dayjs(selectedDay).endOf("week").endOf("day");
  return { start, end };
};

const initialState = {
  selectedTab: "tab-room",
  roomList: [],
  userList: [],
  masterList: [],
  searchTextRoom: "",
  searchTextUser: "",
  searchTextMaster: "",
  selectedRoom: null,
  selectedUser: null,
  selectedMaster: null,
  start: getWeekWindow().start.toISOString(),
  end: getWeekWindow().end.toISOString(),
  roomEvents: [],
  userEvents: [],
  masterEvents: [],
  selectedEvent: null,
  timeZone: "Europe/Paris",
  calendarMode: "Week",
  startDay: dayjs().startOf("month").format("YYYY-MM-DD"),
  selectedDay: dayjs().format("YYYY-MM-DD"),
};

const slice = createSlice({
  name: "calendars",
  initialState,
  reducers: {
    resetCalendars: () => {},
    setRoomList: (state, action) => {
      state.searchTextRoom = action.payload.filter;
      state.roomList = action.payload.list;
    },
    setUserList: (state, action) => {
      state.searchTextUser = action.payload.filter;
      state.userList = action.payload.list;
    },
    setSearchTextMaster: (state, action) => {
      state.searchTextMaster = action.payload;
    },
    setMasterList: (state, action) => {
      state.masterList = action.payload.list;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedMaster: (state, action) => {
      state.selectedMaster = action.payload;
    },
    setSelectedDay: (state, action) => {
      state.start = action.payload.start;
      state.end = action.payload.end;
      state.selectedDay = action.payload.selectedDay;
      const window = {
        start: dayjs(state.startDay),
        end: dayjs(state.startDay).add(2, "month").endOf("month"),
      };

      const mSelected = dayjs(state.selectedDay);
      if (mSelected.isBefore(window.start) || mSelected.isAfter(window.end)) {
        state.startDay = dayjs(state.selectedDay).startOf("month").format("YYYY-MM-DD");
      }
    },
    setRoomEvents: (state, action) => {
      state.roomEvents = action.payload.map((event) => ({
        ...event,
        color: event.color || "#0693E3",
      }));
    },
    setUserEvents: (state, action) => {
      state.userEvents = action.payload.map((event) => ({
        ...event,
        color: event.color || "#0693E3",
      }));
    },
    setMasterEvents: (state, action) => {
      state.masterEvents = action.payload.map((event) => ({
        ...event,
        color: event.color || "#0693E3",
      }));
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;
    },
  },
});

export const {
  resetCalendars,
  setRoomList,
  setUserList,
  setMasterList,
  setSearchTextMaster,
  setSelectedRoom,
  setSelectedUser,
  setSelectedMaster,
  setSelectedDay,
  setRoomEvents,
  setUserEvents,
  setMasterEvents,
  setSelectedEvent,
  setSelectedTab,
} = slice.actions;

export const searchRooms =
  (filter = "") =>
  async (dispatch, getState) => {
    try {
      if (filter.length === 0) return dispatch(setRoomList({ filter, list: [] }));

      const roomListResult = await API(getState()).calendars.listBookableSpaces(filter);
      dispatch(
        setRoomList({
          filter,
          list: roomListResult.sort((a, b) => a.title.localeCompare(b.title)),
        }),
      );
    } catch (error) {
      logger.error("Failed to load rooms", error);
      dispatch(setRoomList({ filter, list: [] }));
    }
  };

export const searchUsers =
  (filter = "") =>
  async (dispatch, getState) => {
    try {
      if (filter.length === 0) return dispatch(setUserList({ filter, list: [] }));

      const userListResult = await API(getState()).users.listUsers(1, 5, filter);
      dispatch(
        setUserList({
          filter,
          list: userListResult.items
            .map((u) => ({
              id: u.id,
              email: u.email,
              displayName: helpers.formatUserName(u),
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName)),
        }),
      );
    } catch (error) {
      logger.error("Failed to load rooms", error);
      dispatch(setRoomList({ filter, list: [] }));
    }
  };

export const listMasterIds = () => async (dispatch, getState) => {
  try {
    const masterListResult = await API(getState()).calendars.listMasterId();
    dispatch(
      setMasterList({
        list: masterListResult
          .map((u) => ({
            id: u.label,
            label: u.label,
            upcomingCount: u.upcomingCount,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      }),
    );
  } catch (error) {
    logger.error("Failed to load masters", error);
    dispatch(setMasterList({ list: [] }));
  }
};

export const createMasterId = (label) => async (dispatch, getState) => {
  try {
    await API(getState()).calendars.createMasterId(label);
    dispatch(listMasterIds());
  } catch (error) {
    logger.error("Failed to create master", error);
  }
};

export const updateMasterId =
  (masterId, { label }) =>
  async (dispatch, getState) => {
    try {
      await API(getState()).calendars.updateMasterId(masterId, label);
      dispatch(listMasterIds());
    } catch (error) {
      logger.error("Failed to update master", error);
    }
  };

export const deleteMasterId = (masterId) => async (dispatch, getState) => {
  try {
    await API(getState()).calendars.deleteMasterId(masterId);
    dispatch(listMasterIds());
  } catch (error) {
    logger.error("Failed to delete master", error);
  }
};

export const selectRoom = (roomRef) => async (dispatch, getState) => {
  try {
    const state = getState();
    const room = state.calendars.roomList.find((r) => r.ref === roomRef);
    if (!room) return;

    dispatch(setSelectedRoom(room));
    dispatch(loadRoomEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to load rooms", error);
  }
};

export const selectUser = (userId) => async (dispatch, getState) => {
  try {
    const user = await API(getState()).users.getUserDetails(userId);

    dispatch(setSelectedUser(user));
    dispatch(loadUserEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to load users", error);
  }
};

export const selectMaster = (master) => async (dispatch) => {
  try {
    dispatch(setSelectedMaster(master));
    dispatch(loadMasterEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to load masters", error);
  }
};

export const loadUserEvents =
  (selectedDay, forceRefresh = false) =>
  async (dispatch, getState) => {
    const state = getState();

    try {
      let start, end;

      if (!selectedDay) {
        selectedDay = getState().calendars.selectedDay;
        start = getState().calendars.start;
        end = getState().calendars.end;
      } else {
        start = getWeekWindow(selectedDay).start.toISOString();
        end = getWeekWindow(selectedDay).end.toISOString();
      }
      const { selectedUser } = getState().calendars;

      dispatch(setSelectedDay({ start, end, selectedDay }));

      if (forceRefresh || dayjs(selectedDay).week() !== dayjs(state.calendars.selectedDay).week()) {
        const userEvents = await API(getState()).calendars.listUserEvents(
          selectedUser.id,
          start,
          end,
        );
        dispatch(setUserEvents(userEvents));
      }
    } catch (error) {
      logger.error("Failed to load events", error);
    }
  };

export const loadRoomEvents =
  (selectedDay, forceRefresh = false) =>
  async (dispatch, getState) => {
    const state = getState();

    try {
      let start, end;

      if (!selectedDay) {
        selectedDay = getState().calendars.selectedDay;
        start = getState().calendars.start;
        end = getState().calendars.end;
      } else {
        start = getWeekWindow(selectedDay).start.toISOString();
        end = getWeekWindow(selectedDay).end.toISOString();
      }
      const { selectedRoom } = getState().calendars;

      dispatch(setSelectedDay({ start, end, selectedDay }));

      if (forceRefresh || dayjs(selectedDay).week() !== dayjs(state.calendars.selectedDay).week()) {
        const roomEvents = await API(getState()).calendars.listRoomEvents(
          selectedRoom.ref,
          start,
          end,
        );
        dispatch(setRoomEvents(roomEvents));
      }
    } catch (error) {
      logger.error("Failed to load events", error);
    }
  };

export const loadMasterEvents =
  (selectedDay, forceRefresh = false) =>
  async (dispatch, getState) => {
    const state = getState();

    try {
      let start, end;

      if (!selectedDay) {
        selectedDay = getState().calendars.selectedDay;
        start = getState().calendars.start;
        end = getState().calendars.end;
      } else {
        start = getWeekWindow(selectedDay).start.toISOString();
        end = getWeekWindow(selectedDay).end.toISOString();
      }
      const { selectedMaster } = getState().calendars;

      dispatch(setSelectedDay({ start, end, selectedDay }));

      if (forceRefresh || dayjs(selectedDay).week() !== dayjs(state.calendars.selectedDay).week()) {
        const masterEvents = await API(getState()).calendars.listMastersEvents(
          selectedMaster,
          start,
          end,
        );
        dispatch(setMasterEvents(masterEvents));
      }
    } catch (error) {
      logger.error("Failed to load events", error);
    }
  };

export const selectEvent = (eventId) => async (dispatch, getState) => {
  try {
    const { selectedRoom } = getState().calendars;

    const event = await API(getState()).calendars.getEvent(selectedRoom.ref, eventId);
    dispatch(setSelectedEvent(event));
  } catch (error) {
    logger.error("Failed to load event", error);
    dispatch(setSelectedEvent([]));
  }
};

export const createEvent = (event, location) => async (dispatch, getState) => {
  try {
    const { selectedRoom } = getState().calendars;

    await API(getState()).calendars.createEvent(location || selectedRoom.ref, event);
    if (!location) dispatch(loadRoomEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to create event", error);
  }
};

export const updateEvent = (event, location) => async (dispatch, getState) => {
  try {
    const { selectedRoom } = getState().calendars;

    await API(getState()).calendars.updateEvent(location || selectedRoom.ref, event.id, event);
    if (!location) dispatch(loadRoomEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to update event", error);
  }
};

export const cancelEvent = (eventId, location) => async (dispatch, getState) => {
  try {
    const { selectedRoom } = getState().calendars;

    await API(getState()).calendars.cancelEvent(location || selectedRoom.ref, eventId);
    if (!location) dispatch(loadRoomEvents(undefined, true));
  } catch (error) {
    logger.error("Failed to delete event", error);
  }
};

export default slice.reducer;
