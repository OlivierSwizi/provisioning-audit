import config from "@/config";

export default (AXIOS, token) => {
  return {
    get: async (mediaId) => {
      let res = await AXIOS.get(`/media/${mediaId}`, {
        responseType: "blob",
      });
      return res.data;
    },
    list: async (page, pageSize, filter, sort, sortOrder) => {
      let res = await AXIOS.get(`/media`, {
        params: { page, pageSize, filter, sort, order: sortOrder },
      });
      return res.data;
    },
    replace: async (mediaId, file) => {
      const formData = new FormData();
      formData.append("mediaFile", file);
      await AXIOS.put(`/media/${mediaId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    delete: async (mediaId) => {
      await AXIOS.delete(`/media/${mediaId}`);
    },
    upload: async (file, tag) => {
      const formData = new FormData();
      formData.append("mediaFile", file);
      formData.append("tag", tag);
      let res = await AXIOS.post(`/media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    getMediaUrl: (appId, mediaId, date) => {
      return `${config.endpoint}/provisioning/apps/${appId}/media/${mediaId}?${date ? `&date=${date}` : ""}`;
    },
    getMediaCookie: async () => {
      try {
        let res = await AXIOS.get(`/media/session`, {
          withCredentials: true,
        });
        return res.data;
      } catch (e) {
        console.log(e);
      }
    },
    listPublicMedias: async (page, pageSize, filter, sort, sortOrder) => {
      let res = await AXIOS.get(`/assets`, {
        params: { page, pageSize, filter, sort, order: sortOrder },
      });
      return res.data;
    },
    uploadAsset: async (file) => {
      const formData = new FormData();
      formData.append("mediaFile", file);
      let res = await AXIOS.post(`/assets`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  };
};
