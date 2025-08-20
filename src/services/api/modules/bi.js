export default (AXIOS) => {
  return {
    listPermissions: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/bi/reports/permissions`);
      return res.data;
    },

    updatePermissions: async (siteId, reportId, groupIds) => {
      let res = await AXIOS.post(`/sites/${siteId}/bi/reports/${reportId}/permissions`, {
        groupIds,
      });
      return res.data;
    },
    removePermission: async (siteId, groupId, reportId) => {
      let res = await AXIOS.delete(
        `/sites/${siteId}/bi/reports/${reportId}/permissions?groupId=${groupId}`,
      );
      return res.data;
    },
  };
};
