export default (AXIOS) => {
  return {
    getConfig: async (siteId) => {
      let res = await AXIOS.get(`sites/${siteId}/config/wifiGuest`);
      return res.data;
    },
    updateConfig: async (siteId, data) => {
      let res = await AXIOS.put(`sites/${siteId}/config/wifiGuest`, data);
      return res.data;
    },
  };
};
