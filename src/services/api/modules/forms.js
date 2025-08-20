import logger from "@/logger";

const FormApi = (AXIOS) => {
  return {
    list: async () => {
      try {
        const res = await AXIOS.get(`forms`);
        return res.data;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    create: async ({ name, startDate, endDate, link, groups }) => {
      try {
        const res = await AXIOS.post(`forms`, { name, startDate, endDate, link, groups });
        return res.data;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    update: async (id, { name, startDate, endDate, link, groups }) => {
      try {
        const res = await AXIOS.put(`forms/${id}`, { name, startDate, endDate, link, groups });
        return res.data;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    delete: async (ids) => {
      try {
        const res = await AXIOS.delete(`forms`, {
          params: { ids: ids.join(",") },
        });
        return res.data;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    countUsers: async ({ groups }) => {
      try {
        const res = await AXIOS.post(`forms/counts`, { groups });
        return res.data;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
  };
};

export default FormApi;
