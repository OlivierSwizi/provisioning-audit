export default (AXIOS) => {
  return {
    listBookableSpaces: async (filter) => {
      let res = await AXIOS.get(`/calendars/rooms`, {
        params: { filter },
      });
      return res.data;
    },
    listRoomEvents: async (roomRef, start, end) => {
      let res = await AXIOS.get(`/calendars/rooms/${roomRef}/events`, {
        params: { start, end },
      });
      return res.data;
    },
    listUserEvents: async (userId, start, end) => {
      let res = await AXIOS.get(`/calendars/users/${userId}/events`, {
        params: { start, end },
      });
      return res.data;
    },
    listMastersEvents: async (masterId, start, end) => {
      let res = await AXIOS.get(`/calendars/masters/${masterId}/events`, {
        params: { start, end },
      });
      return res.data;
    },
    createEvent: async (
      roomRef,
      { organizer, start, end, title, description, attendees, masterId, color, subtitle },
    ) => {
      let res = await AXIOS.post(`/calendars/rooms/${roomRef}/events`, {
        organizer,
        start,
        end,
        title,
        description,
        attendees,
        masterId,
        color,
        subtitle,
      });
      return res.data;
    },
    updateEvent: async (roomRef, eventId, event) => {
      let res = await AXIOS.patch(`/calendars/rooms/${roomRef}/events/${eventId}`, event);
      return res.data;
    },
    getEvent: async (roomRef, eventId) => {
      let res = await AXIOS.get(`/calendars/rooms/${roomRef}/events/${eventId}`);
      return res.data;
    },
    cancelEvent: async (roomRef, eventId) => {
      let res = await AXIOS.delete(`/calendars/rooms/${roomRef}/events/${eventId}`);
      return res.data;
    },
    listMasterId: async () => {
      let res = await AXIOS.get(`/calendars/masters`);
      return res.data;
    },
    createMasterId: async (label) => {
      let res = await AXIOS.post(`/calendars/masters`, { label });
      return res.data;
    },
    updateMasterId: async (masterId, label) => {
      let res = await AXIOS.patch(`/calendars/masters/${masterId}`, {
        label,
      });
      return res.data;
    },
    deleteMasterId: async (masterId) => {
      let res = await AXIOS.delete(`/calendars/masters/${masterId}`);
      return res.data;
    },
    getAvailableRooms: async (start, end, excludeEventId) => {
      let res = await AXIOS.get(`/calendars/availability`, {
        params: { start, end, excludeEventId },
      });
      return res.data;
    },
  };
};
