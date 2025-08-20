export default (AXIOS) => {
  return {
    getNoShowConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/noshow`);
      return res.data;
    },
    setNoShowConfig: async (siteId, data) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/noshow`, data);
      return res.data;
    },
    getAroundMeConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/aroundme`);
      return res.data;
    },
    saveAroundMeConfig: async (siteId, data) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/aroundme`, data);
      return res.data;
    },
    getReceptionConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/reception`);
      return res.data;
    },
    saveReceptionConfig: async (siteId, config) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/reception`, config);
      return res.data;
    },
    getSiteConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/settings`);
      return res.data;
    },
    saveSiteConfig: async (siteId, config) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/settings`, config);
      return res.data;
    },
    getAppEmailConfig: async () => {
      let res = await AXIOS.get(`/settings`);
      return res.data;
    },
    saveAppEmailConfig: async (config) => {
      let res = await AXIOS.put(`/settings`, config);
      return res.data;
    },
    saveSpaasConfig: async (siteId, config) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/spaas`, config);
      return res.data;
    },
    getSpaasConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/spaas`);
      return res.data;
    },
    getSpaasTemplates: async () => {
      let res = await AXIOS.get(`/config/spaas/templates`);
      return res.data;
    },
    saveSpaasTemplates: async (templates) => {
      let res = await AXIOS.put(`/config/spaas/templates`, {
        templates,
      });
      return res.data;
    },
    saveParkingConfig: async (siteId, config) => {
      let res = await AXIOS.put(`/sites/${siteId}/config/parking`, config);
      return res.data;
    },
    getParkingConfig: async (siteId) => {
      let res = await AXIOS.get(`/sites/${siteId}/config/parking`);
      return res.data;
    },
    listAppVersions: async () => {
      let res = await AXIOS.get(`/store`);
      return res.data;
    },
    updateAppVersions: async (versions) => {
      let res = await AXIOS.patch(`/store`, versions);
      return res.data;
    },
    places: {
      list: async (siteId) => {
        let res = await AXIOS.get(`/sites/${siteId}/config/places`);
        return res.data;
      },
      checkLocation: async (siteId, reference) => {
        let res = await AXIOS.get(`/sites/${siteId}/config/places/location?reference=${reference}`);

        return res.data;
      },
      update: async (siteId, sectionId, contentId, place) => {
        let res = await AXIOS.put(`/sites/${siteId}/config/places`, {
          sectionId,
          contentId,
          place,
        });
        return res.data;
      },
    },
  };
};
