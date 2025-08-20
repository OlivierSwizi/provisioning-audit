import { combineReducers } from "redux";

import admin from "../features/AdminSlice";
import apps from "../features/AppsSlice";
import auth from "../features/AuthSlice";
import ui from "../features/UISlice";
import users from "../features/UsersSlice";
import groups from "../features/GroupsSlice";
import calendars from "../features/CalendarsSlice";
import form from "../features/FormSlice";

const rootReducer = combineReducers({
  admin,
  apps,
  auth,
  ui,
  users,
  groups,
  calendars,
  form,
});

const configureRootReducer = (state, action) => rootReducer(state, action);
export default configureRootReducer;
