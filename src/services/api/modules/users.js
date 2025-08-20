import config from "@/config";

export default (AXIOS, token) => {
  return {
    //get list of all users for a customer
    listUsers: async (page, size, search) => {
      let res = await AXIOS.get(`/users`, {
        params: { page, size, filter: search || null },
      });
      return res.data;
    },
    getUserDetails: async (id) => {
      let res = await AXIOS.get(`/users/${id}`);
      return res.data;
    },
    getUserAccess: async (id) => {
      let res = await AXIOS.get(`/users/${id}/access`, {});
      return res.data;
    },
    getPhotoUrl: async (id) => {
      return `${config.endpoint}/usersgroups/users/${id}/photo?access_token=${token}`;
    },
    getUsersFromIdList: async (userIds) => {
      let res = await AXIOS.post(`/usersgroups/userlist`, {
        userIds,
      });
      return res.data;
    },
    getUsersFromEmailList: async (userEmails) => {
      let res = await AXIOS.post(`/usersgroups/userlist`, {
        userEmails,
      });
      return res.data;
    },
    updateUserDetails: async (id, userInfo) => {
      if (userInfo.brokerExtId === "") delete userInfo.brokerExtId;
      let res = await AXIOS.put(`/users/${id}`, userInfo);
      return res.data;
    },
    enableUsers: async (userIds, enable) => {
      await AXIOS.put(`/users/enable`, { userIds, enable });
    },
    checkValidity: async (email, login) => {
      let res = await AXIOS.get(`/users/valid`, {
        params: { email, login },
      });
      return res.data.isValid;
    },
    createUser: async (userInfo) => {
      let res = await AXIOS.post(`/users`, userInfo);
      return res.data;
    },
    updateUserAccess: async (
      userId,
      siteId,
      accessCode,
      expiresAt,
      isPresent,
      presenceExpiresAt = "",
    ) => {
      let res = await AXIOS.put(`/users/${userId}/access`, {
        siteId,
        accessCode,
        expiresAt,
        isPresent,
        presenceExpiresAt: presenceExpiresAt || "",
      });
      return res.data;
    },
    removeUserAccess: async (userId, siteId) => {
      await AXIOS.delete(`/users/${userId}/access`, {
        params: { siteId },
      });
    },
  };
};
