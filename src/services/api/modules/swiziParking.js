export default (AXIOS) => {
  return {
    listSectors: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/parking/swizi/sectors`);
      return res.data;
    },
    updateSectors: async (siteId, sectors) => {
      await AXIOS.patch(`/sites/${siteId}/config/parking/swizi/sectors`, sectors);
    },
  };
};
