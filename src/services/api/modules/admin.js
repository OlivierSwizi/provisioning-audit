import config from "@/config";
import axios from "axios";

export default (_, token) => {
  const AXIOS_ADMIN = axios.create({
    baseURL: config.endpoint.replace(/\/$/, "") + `/provisioning/admin`,
  });

  AXIOS_ADMIN.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  });
  return {
    listUsers: async () => {
      let res = await AXIOS_ADMIN.get(`/users`, {});
      return res.data;
    },
    loadConfig: async () => {
      let res = await AXIOS_ADMIN.get(`/config`, {});
      return res.data;
    },
    loadUserPermissions: async (email) => {
      let res = await AXIOS_ADMIN.get(`/users/${email}/access`, {});
      return res.data;
    },
    saveUserPermissions: async (email, data) => {
      let res = await AXIOS_ADMIN.patch(`/users/${email}/access`, data);
      return res.data;
    },
    updateUserRoles: async (userId, roles) => {
      let res = await AXIOS_ADMIN.put(`/users/${userId}/roles`, roles);
      return res.data;
    },
    createUser: async ({ firstName, lastName, email }) => {
      let res = await AXIOS_ADMIN.post(`/users`, {
        firstName,
        lastName,
        email,
      });
      return res.data;
    },
    listUserSitesScopes: async (userId) => {
      let res = await AXIOS_ADMIN.get(`/users/${userId}/sites`, {});
      return res.data;
    },
    addUserSiteScope: async (appId, userId, siteId) => {
      let res = await AXIOS_ADMIN.put(`/users/${userId}/sites`, {
        siteId,
        appId,
      });
      return res.data;
    },
    removeUserSiteScope: async (appId, userId, siteId) => {
      let res = await AXIOS_ADMIN.delete(`/users/${userId}/sites?siteId=${siteId}&appId=${appId}`);
      return res.data;
    },
  };
};
