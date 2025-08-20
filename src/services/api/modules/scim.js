import dayjs from "dayjs";

export default (AXIOS) => {
  return {
    getHistory: async (page, pageSize, filter, startDate, endDate) => {
      let res = await AXIOS.post(`/scim/history`, {
        page,
        pageSize,
        filter,
        fromDate: dayjs(startDate).toISOString(),
        toDate: dayjs(endDate).toISOString(),
      });
      return res.data;
    },
    getConfig: async () => {
      let res = await AXIOS.get(`/scim/configuration`);
      return res.data;
    },
    updateConfig: async (data) => {
      let res = await AXIOS.put(`/scim/configuration`, data);
      return res.data;
    },
    revokeToken: async (secretId) => {
      await AXIOS.delete(`/scim/token/${secretId}`);
    },
    addToken: async (duration) => {
      let res = await AXIOS.post(`/scim/token?expiresInMonths=${duration}`);
      return res.data;
    },
    cleanHistory: async () => {
      await AXIOS.delete(`/scim/history`);
    },
  };
};
