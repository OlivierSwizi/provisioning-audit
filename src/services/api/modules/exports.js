export default (AXIOS) => {
  return {
    spaas: async ({ siteId, startDate, endDate }) => {
      const res = await AXIOS.post(`/sites/${siteId}/exports/sbslots`, {
        startDate,
        endDate,
      });
      return res.data;
    },
  };
};
