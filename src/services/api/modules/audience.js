import config from "@/config";
import axios from "axios";

export default (AXIOS, token) => {
  const AXIOS_ADMIN = axios.create({
    baseURL: config.endpoint.replace(/\/$/, "") + `/provisioning/admin`,
  });

  AXIOS_ADMIN.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  });

  return {
    getAnalytics: async (from, to, path) => {
      let res = await AXIOS.get(`/audience/users?from=${from}&to=${to}&path=${path}`);
      return res.data;
    },
    getGlobalAnalytics: async (from, to, path) => {
      let res = await AXIOS_ADMIN.get(`/audience/users?from=${from}&to=${to}&path=${path}`);
      return res.data;
    },
    downloadUsers: async (from, to, path) => {
      const result = await AXIOS.get(`/audience/extract?from=${from}&to=${to}&path=${path}`, {
        responseType: "blob",
      });

      return result.data;
    },
  };
};
