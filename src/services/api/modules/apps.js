import config from "@/config";
import axios from "axios";

export default (_, token) => {
  const AXIOS_GLOBAL = axios.create({
    baseURL: config.endpoint.replace(/\/$/, "") + `/provisioning`,
  });

  AXIOS_GLOBAL.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  });

  return {
    getUserAccess: async () => {
      const res = await AXIOS_GLOBAL.get(`/global/access`);
      return res.data;
    },
    //get tenant / env
    getEnvConfig: async () => {
      let res = await AXIOS_GLOBAL.get(`/global/config`);
      return res.data;
    },
    //get list of application
    listApps: async () => {
      let res = await AXIOS_GLOBAL.get(`/global/apps`);
      return res.data;
    },
    //get details for an application
    selectedApp: async (appId) => {
      let res = await AXIOS_GLOBAL.get(`/apps/${appId}`);
      return res.data;
    },
    getAppSites: async (appId) => {
      let res = await AXIOS_GLOBAL.get(`/apps/${appId}/sites`);
      return res.data;
    },
    getAppSectors: async (appId) => {
      let res = await AXIOS_GLOBAL.get(`/apps/${appId}/sectors`);
      return res.data;
    },
  };
};
