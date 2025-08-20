export default (AXIOS) => {
  return {
    listRoomTypes: async (siteId) => {
      try {
        let res = await AXIOS.get(`/sites/${siteId}/config/roomtypes`);
        return res.data;
      } catch (error) {
        if (error.response.status === 404) return null;
      }
    },
    getSearchableRoomTypes: async (siteId) => {
      try {
        let res = await AXIOS.get(`/sites/${siteId}/config/searchable/roomtypes`);
        return res.data;
      } catch (error) {
        if (error.response.status === 404) return null;
      }
    },
    updateSearchableRoomTypes: async (siteId, list = []) => {
      try {
        let res = await AXIOS.put(`/sites/${siteId}/config/searchable/roomtypes`, list);
        return res.data;
      } catch (error) {
        if (error.response.status === 404) return null;
      }
    },
  };
};
