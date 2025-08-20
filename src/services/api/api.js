import config from "@/config";
import axios from "axios";
import formApi from "./modules/forms";

import appsApi from "./modules/apps";
import sitesApi from "./modules/sites";
import plannerApi from "./modules/planner";
import featuresApi from "./modules/features";
import azureApi from "./modules/azure";
import swiziParkingApi from "./modules/swiziParking";
import groupsApi from "./modules/groups";
import usersApi from "./modules/users";
import adminApi from "./modules/admin";
import exportsApi from "./modules/exports";
import calendarsApi from "./modules/calendars";
import historyApi from "./modules/history";
import scimApi from "./modules/scim";
import mediaApi from "./modules/media";
import audienceApi from "./modules/audience";
import cmApi from "./modules/cm";
import biApi from "./modules/bi";
import flexofficeApi from "./modules/flexoffice";
import wifiGuestApi from "./modules/wifiguest";

const api = (appId, locale, token) => {
  const AXIOS = axios.create({
    baseURL: config.endpoint.replace(/\/$/, "") + `/provisioning/apps/${appId}`,
  });

  AXIOS.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["app-id"] = appId;
    config.headers["locale"] = locale;
    return config;
  });

  return {
    apps: appsApi(AXIOS, token),
    sites: sitesApi(AXIOS, token),
    planner: plannerApi(AXIOS, token),
    features: featuresApi(AXIOS, token),
    swiziParking: swiziParkingApi(AXIOS, token),
    azure: azureApi(AXIOS, token),
    groups: groupsApi(AXIOS, token),
    users: usersApi(AXIOS, token),
    admin: adminApi(AXIOS, token),
    exports: exportsApi(AXIOS, token),
    calendars: calendarsApi(AXIOS, token),
    history: historyApi(AXIOS, token),
    scim: scimApi(AXIOS, token),
    media: mediaApi(AXIOS, token),
    audience: audienceApi(AXIOS, token),
    cm: cmApi(AXIOS, token),
    bi: biApi(AXIOS, token),
    flexoffice: flexofficeApi(AXIOS, token),
    form: formApi(AXIOS, token),
    wifiGuest: wifiGuestApi(AXIOS, token),
  };
};

export default api;
