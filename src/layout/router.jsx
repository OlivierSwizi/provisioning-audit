import { createBrowserRouter } from "react-router-dom";

import AdminView from "../views/Admin/AdminView";
import AppDetails from "../views/AppDetails/AppDetails";
import AppList from "../views/AppsList/AppList";
import NotFound from "../views/Errors/NotFound";
import UserList from "../views/Users/UserList";
import GroupList from "../views/Groups/GroupList";
import UserDetails from "../views/Users/UserDetails";
import GroupDetails from "../views/Groups/GroupDetails";
import GroupCreation from "../views/Groups/GroupCreation";
import NoShowView from "../views/Features/NoShow/NoShowView";
import ReceptionView from "../views/Features/Reception/ReceptionView";
import AppLayout from "./AppLayout";
import HomeLayout from "./HomeLayout";
import CalendarList from "../views/Calendars/CalendarList";
import CalendarRoomDetails from "../views/Calendars/CalendarRoomDetails";
import CalendarUserDetails from "../views/Calendars/CalendarUserDetails";
import CalendarMasterDetails from "../views/Calendars/CalendarMasterDetails";
import SiteSettingsView from "@/views/Features/SiteSettings/SiteSettingsView";
import SpaasView from "@/views/Features/Spaas/SpaasView";
import ParkingView from "@/views/Features/Parking/ParkingView";
import HistoryView from "@/views/Features/History/HistoryView";
import LibraryView from "@/views/Library/LibraryView";
import SCIMView from "@/views/Features/SCIM/SCIMView";
import PlannerView from "@/views/Features/Planner/PlannerView";
import CMView from "@/views/Features/CM/CMView";
import PlacesView from "@/views/Features/Places/PlacesView";
import AudienceView from "@/views/Audience/AudienceView";
import BIView from "@/views/Features/BI/BIView";
import Forms from "@/views/Forms/Forms";
import AppSettingsView from "@/views/Features/App/AppSettingsView";
import FlexOfficeView from "@/views/FlexOffice/FlexOfficeView";

/** @type {import("react-router").RouteObject[]} */
export const appRoutes = [
  {
    path: "",
    element: <AppDetails />,
    handle: {
      inMenu: true,
      key: "appdetails",
      icon: "dashboard",
      label: "General",
    },
  },
  {
    path: "users",
    element: <UserList />,
    handle: {
      inMenu: true,
      key: "users",
      icon: "person",
      label: "users",
      roles: ["usersgroups", "admin"],
    },
  },

  {
    path: "groups",
    element: <GroupList />,
    handle: {
      inMenu: true,
      key: "groups",
      icon: "groups",
      label: "Groups",
      roles: ["usersgroups", "admin"],
    },
  },
  {
    path: "groups",
    element: <GroupList />,
    handle: {
      inMenu: true,
      key: "groups",
      icon: "groups",
      label: "Groups",
      roles: ["usersgroups", "business"],
    },
  },
  {
    path: "calendars",
    element: <CalendarList />,
    handle: {
      inMenu: true,
      key: "calendars",
      icon: "date_range",
      label: "calendars",
      roles: ["calendars", "admin"],
    },
  },
  {
    path: "forms",
    element: <Forms />,
    handle: {
      inMenu: true,
      key: "forms",
      icon: "mood",
      label: "forms",
      roles: ["forms", "admin"],
    },
  },
  {
    path: "forms",
    element: <Forms />,
    handle: {
      inMenu: true,
      key: "forms",
      icon: "mood",
      label: "forms",
      roles: ["forms", "business"],
    },
  },
  {
    path: "users/:userId",
    element: <UserDetails />,
    handle: {
      label: "User details",
    },
    roles: ["usersgroups", "admin"],
  },
  {
    path: "users/:userId",
    element: <UserDetails />,
    handle: {
      label: "User details",
    },
    roles: ["usersgroups", "business"],
  },
  {
    path: "calendars/room/:roomRef",
    element: <CalendarRoomDetails />,
    handle: {
      inMenu: false,
      key: "calendar",
      icon: "calendar",
      label: "Calendar",
      roles: ["calendars", "admin"],
    },
  },
  {
    path: "calendars/user/:userId",
    element: <CalendarUserDetails />,
    handle: {
      inMenu: false,
      key: "calendar",
      icon: "calendar",
      label: "Calendar",
      roles: ["calendars", "admin"],
    },
  },
  {
    path: "calendars/master/:masterId",
    element: <CalendarMasterDetails />,
    handle: {
      inMenu: false,
      key: "calendar",
      icon: "calendar",
      label: "Calendar",
      roles: ["calendars", "admin"],
    },
  },
  {
    path: "groups/:groupId",
    element: <GroupDetails />,
    handle: {
      label: "Group details",
    },
    roles: ["usersgroups", "admin", "business"],
  },

  {
    path: "groups/new",
    element: <GroupCreation />,
    handle: {
      label: "Group creation",
    },
    roles: ["usersgroups", "admin"],
  },
  {
    handle: {
      inMenu: true,
      key: "appConfig",
      icon: "tune",
      label: "app-configuration",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/mobile-apps",
    element: <AppSettingsView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "mobile-apps",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/site-settings",
    element: <SiteSettingsView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "site-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/places-settings",
    element: <PlacesView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "places-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/noshow",
    element: <NoShowView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "no-show",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/bi",
    element: <BIView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "bi",
      roles: ["config", "admin"],
    },
  },

  /*
  {
    path: "config/arroundme",
    element: <AroundMeView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "aroundme",
      roles: ["config", "admin"],
    },
  },
  */
  {
    path: "config/reception",
    element: <ReceptionView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "reception",
      roles: ["config", "admin"],
    },
  },

  {
    path: "config/spaas",
    element: <SpaasView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "spaas-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/parking",
    element: <ParkingView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "parking-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/scim",
    element: <SCIMView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "scim-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/planner",
    element: <PlannerView />,
    CMForbidden: true,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "planner-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/cm",
    element: <CMView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "cm-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "flexoffice",
    element: <FlexOfficeView />,
    handle: {
      inMenu: true,
      key: "flexoffice",
      icon: "desk",
      label: "flexoffice",
      roles: ["flexoffice", "all"],
    },
  },
  {
    path: "history",
    element: <HistoryView />,
    handle: {
      inMenu: true,
      key: "history",
      icon: "watch_later",
      label: "history",
      roles: ["history", "reader"],
    },
  },
  {
    path: "library",
    element: <LibraryView />,
    handle: {
      inMenu: true,
      key: "library",
      icon: "image",
      label: "library",
      roles: ["library", "admin"],
    },
  },
  {
    path: "audience",
    element: <AudienceView />,
    handle: {
      inMenu: true,
      key: "audience",
      icon: "show_chart",
      label: "audience",
      roles: ["analytics", "all"],
    },
  },
];

/** @type {import("react-router").RouteObject[]} */
export const mainRoutes = [
  {
    path: "",
    element: <AppList />,
    roles: ["customers", "admin"],
  },
  {
    path: "admin",
    element: <AdminView />,
  },
  {
    path: "admin/audience",
    element: <AudienceView admin={true} />,
  },
];

/** @type {import("react-router").RouteObject[]} */
export const routes = [
  /**
   * OTHERS
   */
  {
    path: "/apps/:appId",
    element: <AppLayout />,
    children: appRoutes,
  },
  {
    path: "/",
    element: <HomeLayout />,
    children: mainRoutes,
  },
  {
    path: "*",
    element: <NotFound />,
    key: "notfound",
  },
];

const router = createBrowserRouter(routes);
export default router;
