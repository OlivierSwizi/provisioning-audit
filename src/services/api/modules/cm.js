export default (AXIOS) => {
  return {
    activate: async (useCM) => {
      try {
        let res = await AXIOS.put(`/cm/activate`, {
          useCM,
        });
        return res.data;
      } catch (err) {
        if (err.response.status === 409) return err.response.status;
      }
    },

    getKeycloakConfig: async () => {
      let res = await AXIOS.get(`/cm/keycloak`);
      return res.data;
    },
    listProviders: async () => {
      let res = await AXIOS.get(`/cm/providers`);
      return res.data;
    },
    createProvider: async ({ name, type, config, domains, disabled }) => {
      let res = await AXIOS.post(`/cm/providers`, {
        name,
        type,
        config,
        domains,
        disabled,
      });
      return res.data;
    },
    updateProvider: async (
      providerId,
      { name, type, config, domains, disabled, providerConfig },
    ) => {
      let res = await AXIOS.put(`/cm/providers/${providerId}`, {
        name,
        type,
        config,
        domains,
        disabled,
        providerConfig,
      });
      return res.data;
    },

    deleteProvider: async (providerId) => {
      let res = await AXIOS.delete(`/cm/providers/${providerId}`);
      return res.data;
    },
    getProviders: async () => {
      let res = await AXIOS.get(`/cm/providers`);
      return res.data;
    },
    listLocationStatus: async (providerId, { filter, onlyErrors, page, pageSize }) => {
      let res = await AXIOS.get(`/cm/providers/${providerId}/locations`, {
        params: { filter, onlyErrors, page, pageSize },
      });
      return res.data;
    },
    cleanLocationsErrors: async (providerId) => {
      let res = await AXIOS.delete(`/cm/providers/${providerId}/locations/errors`);
      return res.data;
    },
  };
};
