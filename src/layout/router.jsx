import React, { lazy } from "react";

import { createBrowserRouter } from "react-router-dom";
import withSuspense from "@/utils/withSuspense";

const GroupList = withSuspense(lazy(() => import("@/views/Groups/GroupList")));
const AdminView = withSuspense(lazy(() => import("@/views/Admin/AdminView")));
const AppDetails = withSuspense(lazy(() => import("@/views/AppDetails/AppDetails")));
const AppList = withSuspense(lazy(() => import("@/views/AppsList/AppList")));
const NotFound = withSuspense(lazy(() => import("@/views/Errors/NotFound")));
const UserList = withSuspense(lazy(() => import("@/views/Users/UserList")));
const UserDetails = withSuspense(lazy(() => import("@/views/Users/UserDetails")));
const GroupDetails = withSuspense(lazy(() => import("@/views/Groups/GroupDetails")));
const GroupCreation = withSuspense(lazy(() => import("@/views/Groups/GroupCreation")));
const NoShowView = withSuspense(lazy(() => import("@/views/Features/NoShow/NoShowView")));
const ReceptionView = withSuspense(lazy(() => import("@/views/Features/Reception/ReceptionView")));
const AppLayout = withSuspense(lazy(() => import("./AppLayout")));
const HomeLayout = withSuspense(lazy(() => import("./HomeLayout")));
const CalendarList = withSuspense(lazy(() => import("@/views/Calendars/CalendarList")));
const CalendarRoomDetails = withSuspense(
  lazy(() => import("@/views/Calendars/CalendarRoomDetails")),
);
const CalendarUserDetails = withSuspense(
  lazy(() => import("@/views/Calendars/CalendarUserDetails")),
);
const CalendarMasterDetails = withSuspense(
  lazy(() => import("@/views/Calendars/CalendarMasterDetails")),
);
const SiteSettingsView = withSuspense(
  lazy(() => import("@/views/Features/SiteSettings/SiteSettingsView")),
);
const SpaasView = withSuspense(lazy(() => import("@/views/Features/Spaas/SpaasView")));
const ParkingView = withSuspense(lazy(() => import("@/views/Features/Parking/ParkingView")));
const HistoryView = withSuspense(lazy(() => import("@/views/Features/History/HistoryView")));
const LibraryView = withSuspense(lazy(() => import("@/views/Library/LibraryView")));
const SCIMView = withSuspense(lazy(() => import("@/views/Features/SCIM/SCIMView")));
const PlannerView = withSuspense(lazy(() => import("@/views/Features/Planner/PlannerView")));
const CMView = withSuspense(lazy(() => import("@/views/Features/CM/CMView")));
const PlacesView = withSuspense(lazy(() => import("@/views/Features/Places/PlacesView")));
const AudienceView = withSuspense(lazy(() => import("@/views/Audience/AudienceView")));
const BIView = withSuspense(lazy(() => import("@/views/Features/BI/BIView")));
const Forms = withSuspense(lazy(() => import("@/views/Forms/Forms")));
const AppSettingsView = withSuspense(lazy(() => import("@/views/Features/App/AppSettingsView")));
const FlexOfficeView = withSuspense(lazy(() => import("@/views/FlexOffice/FlexOfficeView")));

/** @type {import("react-router").RouteObject[]} */
export const appRoutes = [
  {
    path: "",
    element: <AppDetails />,
    handle: {
      inMenu: true,
      key: "appdetails",
      icon: "dashboard",
      label: "menu.general",
    },
  },
  {
    path: "users",
    element: <UserList />,
    handle: {
      inMenu: true,
      key: "users",
      icon: "person",
      label: "menu.users",
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
      label: "menu.groups",
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
      label: "menu.groups",
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
      label: "menu.calendars",
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
      label: "menu.forms",
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
      label: "menu.forms",
      roles: ["forms", "business"],
    },
  },
  {
    path: "users/:userId",
    element: <UserDetails />,
    handle: {
      label: "menu.user-details",
    },
    roles: ["usersgroups", "admin"],
  },
  {
    path: "users/:userId",
    element: <UserDetails />,
    handle: {
      label: "menu.user-details",
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
      label: "menu.calendar",
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
      label: "menu.calendar",
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
      label: "menu.calendar",
      roles: ["calendars", "admin"],
    },
  },
  {
    path: "groups/:groupId",
    element: <GroupDetails />,
    handle: {
      label: "menu.group-details",
    },
    roles: ["usersgroups", "admin", "business"],
  },

  {
    path: "groups/new",
    element: <GroupCreation />,
    handle: {
      label: "menu.group-creation",
    },
    roles: ["usersgroups", "admin"],
  },
  {
    handle: {
      inMenu: true,
      key: "appConfig",
      icon: "tune",
      label: "menu.app-configuration",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/mobile-apps",
    element: <AppSettingsView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.mobile-apps",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/site-settings",
    element: <SiteSettingsView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.site-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/places-settings",
    element: <PlacesView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.places-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/noshow",
    element: <NoShowView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.no-show",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/bi",
    element: <BIView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.bi",
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
      label: "menu.aroundme",
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
      label: "menu.reception",
      roles: ["config", "admin"],
    },
  },

  {
    path: "config/spaas",
    element: <SpaasView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.spaas-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/parking",
    element: <ParkingView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.parking-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/scim",
    element: <SCIMView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.scim-settings",
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
      label: "menu.planner-settings",
      roles: ["config", "admin"],
    },
  },
  {
    path: "config/cm",
    element: <CMView />,
    handle: {
      inMenu: true,
      parent: "appConfig",
      label: "menu.cm-settings",
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
      label: "menu.flexoffice",
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
      label: "menu.history",
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
      label: "menu.library",
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
      label: "menu.audience",
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
