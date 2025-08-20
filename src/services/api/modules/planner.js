export default (AXIOS) => {
  return {
    getConfig: async () => {
      try {
        let res = await AXIOS.get(`/planner`);
        return res.data;
      } catch (error) {
        if (error.response.status === 404) return null;
      }
    },
    saveConfig: async (config) => {
      let res = await AXIOS.put(`/planner`, config);
      return res;
    },
    configure: async () => {
      let res = await AXIOS.post(`/planner`);
      return res.data;
    },
    cleanCache: async (type) => {
      await AXIOS.delete(`/planner/cache?type=${type}`);
    },
    renewSubscriptions: async () => {
      await AXIOS.post(`/planner/subscribe`);
    },
  };
};
