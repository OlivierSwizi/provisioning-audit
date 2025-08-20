export default (AXIOS) => {
  return {
    searchDesk: async (siteId, search, mode) => {
      let res = await AXIOS.get(`/sites/${siteId}/spaas/desks`, {
        params: { search, mode },
      });
      return res.data;
    },
    listDeskBooking: async (siteId, deskUid, from, page, pageSize) => {
      let res = await AXIOS.get(`/sites/${siteId}/spaas/desks/${deskUid}`, {
        params: { from, page, pageSize },
      });
      return res.data;
    },
    listUserBooking: async (siteId, userId, from, page, pageSize) => {
      let res = await AXIOS.get(`/sites/${siteId}/spaas/users/${userId}`, {
        params: { from, page, pageSize },
      });
      return res.data;
    },
  };
};
