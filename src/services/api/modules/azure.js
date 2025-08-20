export default (AXIOS) => {
  return {
    syncGroups: async (groupIds, syncPhoto) => {
      await AXIOS.get(`/azure/syncGroups`, {
        params: { syncPhoto, groupIds },
      });
    },
    searchGroup: async (tenantName, label) => {
      let result = await AXIOS.get(`/azure/searchGroup`, {
        params: { tenantName, label },
      });
      return result.data;
    },
    getGroupByAzureId: async (azureId) => {
      let result = await AXIOS.get(`/azure/azureid/${azureId}`);
      return result.data;
    },
  };
};
