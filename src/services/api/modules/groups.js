export default (AXIOS) => {
  return {
    listGroups: async () => {
      let res = await AXIOS.get(`/groups`, {
        params: { userCount: true },
      });
      return res.data;
    },
    listChildren: async (groupId) => {
      let res = await AXIOS.get(`/groups/${groupId}/children`);
      return res.data;
    },
    addChildren: async (groupId, childrenIds) => {
      let res = await AXIOS.put(`/groups/${groupId}/children`, {
        childrenIds,
      });
      return res.data;
    },
    removeChildren: async (groupId, childrenId) => {
      let res = await AXIOS.delete(`/groups/${groupId}/children?childrenId=${childrenId}`);
      return res.data;
    },
    searchGroups: async ({
      filter,
      types,
      includeArchived,
      page,
      pageSize,
      userCount,
      includeGlobalGroups = false,
    }) => {
      let res = await AXIOS.get(`/groups`, {
        params: {
          userCount,
          filter,
          types,
          includeArchived,
          page,
          pageSize,
          includeGlobalGroups,
        },
      });
      return res.data;
    },
    usersOfGroup: async (groupId, page, size, search) => {
      const parameters = {
        groupid: groupId,
        page,
        filter: search || undefined,
        size,
      };
      let res = await AXIOS.get(`/usersgroups/targetGroup`, {
        params: parameters,
      });
      return res?.data;
    },
    addUsersToGroup: async (groupId, userIds) => {
      await AXIOS.put(
        `/groups/${groupId}/members`,
        {},
        {
          params: { userIds },
        },
      );
    },
    addManagersToGroup: async (groupId, userIds) => {
      await AXIOS.put(
        `/groups/${groupId}/managers`,
        {},
        {
          params: { userIds },
        },
      );
    },
    removeUsersFromGroup: async (groupId, userIds) => {
      await AXIOS.delete(`/groups/${groupId}/members`, {
        params: { userIds },
      });
    },
    removeManagersFromGroup: async (groupId, userIds) => {
      await AXIOS.delete(`/groups/${groupId}/managers`, {
        params: { userIds },
      });
    },
    downloadUsersExcelFromGroup: async (groupId) => {
      const result = await AXIOS.get(`/groups/${groupId}/excel`, {
        responseType: "blob",
      });

      return result.data;
    },
    uploadUsersExcelToGroup: async (groupId, file) => {
      const formData = new FormData();
      formData.append("file", file);

      await AXIOS.put(`/groups/${groupId}/excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    updateGroup: async (
      groupId,
      displayName,
      isBusinessGroup,
      provisioningSite,
      searchable,
      description,
    ) => {
      await AXIOS.put(`/groups/${groupId}`, {
        displayName,
        provisioningType: isBusinessGroup ? "business" : "security",
        provisioningSite,
        searchable,
        description,
      });
    },
    deleteGroup: async (groupId) => {
      await AXIOS.delete(`/groups/${groupId}`);
    },
    addGroup: async (
      type,
      externalId,
      displayName,
      tenantName,
      provisioningType,
      provisioningSite,
      isChatChannel,
      isInContactList,
    ) => {
      let res = await AXIOS.post(`/groups`, {
        type,
        externalId,
        displayName,
        tenantName,
        provisioningType,
        siteId: provisioningSite,
        isChatChannel,
        isInContactList,
      });
      return res.data;
    },
    getGroup: async (groupId) => {
      let res = await AXIOS.get(`/groups/${groupId}`);
      return res.data;
    },
    createIMChannelGroup: async (groupId) => {
      let res = await AXIOS.put(`/groups/${groupId}/channel`);
      return res.data;
    },
    updateOptions: async (groupId, options) => {
      await AXIOS.put(`/groups/${groupId}/options`, options);
    },
    updateFeatureConfig: async (groupId, featureConfig) => {
      await AXIOS.put(`/groups/${groupId}/features`, {
        featureConfig,
      });
    },
    addSectorToGroup: async (siteId, groupId, sectorId) => {
      await AXIOS.put(`/groups/${groupId}/sectors`, {
        siteId,
        sectorId,
      });
    },
    removeSectorFromGroup: async (siteId, groupId, sectorId) => {
      await AXIOS.delete(`/groups/${groupId}/sectors`, {
        params: { siteId, sectorId },
      });
    },
    publishMessageInChannelGroup: async (groupId, message, type) => {
      await AXIOS.put(`/groups/${groupId}/channel/message`, {
        message,
        type,
      });
    },
    updateMessageInChannelGroup: async (groupId, messageId, message, type) => {
      await AXIOS.put(`/groups/${groupId}/channel/message/${messageId}`, {
        message,
        type,
      });
    },
    listIMChannelMessages: async (groupId) => {
      let res = await AXIOS.get(`/groups/${groupId}/channel/message`);
      return res.data;
    },
    updateContactList: async (groupId, isInContactList, restrictMembers) => {
      let res = await AXIOS.put(`/groups/${groupId}/contactList`, {
        isInContactList,
        restrictMembers,
      });
      return res.data;
    },
    updateHomebase: async (groupId, sectorId, isHomebase) => {
      await AXIOS.put(`/groups/${groupId}/sectors/${sectorId}/homebase`, {
        isHomebase,
      });
    },
  };
};
