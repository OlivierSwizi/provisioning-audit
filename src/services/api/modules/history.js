import dayjs from "dayjs";

export default (AXIOS) => {
  return {
    getHistory: async (siteId, page, pageSize, filter, startDate, endDate) => {
      let res = await AXIOS.post(`/sites/${siteId}/history`, {
        page,
        pageSize,
        filter,
        fromDate: dayjs(startDate).toISOString(),
        toDate: dayjs(endDate).toISOString(),
      });
      return res.data;
    },
    listHistoryRooms: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/history/rooms`);
      return res.data;
    },
  };
};
