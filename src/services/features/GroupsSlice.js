import logger from "@/logger";
import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import dayjs from "dayjs";
import { API } from "./AuthSlice";

const initialState = {
  filter: "",
};

const slice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    groupsFilterUpdated: (state, action) => {
      state.filter = action.payload.filter;
    },
  },
});

// export const {} = slice.actions;

const { groupsFilterUpdated } = slice.actions;

export const updateGroupFilter = (filter) => async (dispatch) => {
  dispatch(groupsFilterUpdated({ filter }));
};

export const resetGroups = () => async (dispatch) => {
  dispatch(groupsFilterUpdated({ filter: "" }));
};

export const searchGroups =
  (filter, types, includeArchived, page, pageSize, userCount = true) =>
  async (dispatch, getState) => {
    try {
      return await API(getState()).groups.searchGroups({
        filter,
        types,
        includeArchived,
        page,
        pageSize,
        userCount,
      });
    } catch (error) {
      logger.error("Failed to load groups", error);
      message.error("Failed to load groups");
      return { total: 0, items: [] };
    }
  };

export const getGroup = (id) => async (dispatch, getState) => {
  try {
    const group = await API(getState()).groups.getGroup(id);
    group.isChatChannel = !!group.chatChannelId;

    if (group.type === "AZURE_AD" && group.externalId) {
      const azureGroup = await API(getState()).azure.getGroupByAzureId(group.externalId);
      group.externalName = azureGroup.displayName;
    }

    return group;
  } catch (error) {
    logger.error("Failed to load group", error);
    message.error("Failed to load group");
    return { total: 0, items: [] };
  }
};

export const removeManagersFromGroup = (group, userIds) => async (dispatch, getState) => {
  await API(getState()).groups.removeManagersFromGroup(group.id, userIds);
};

export const addManagersToGroup = (group, userIds) => async (dispatch, getState) => {
  await API(getState()).groups.addManagersToGroup(group.id, userIds);
};

export const renameGroup = (group, name) => async (dispatch, getState) => {
  await API(getState()).groups.updateGroup(
    group.id,
    name,
    group.provisioningType !== "business",
    group.provisioningSite,
    group.searchable,
  );
};
export const udpateGroupDescription = (group, description) => async (dispatch, getState) => {
  await API(getState()).groups.updateGroup(
    group.id,
    group.label,
    group.provisioningType !== "business",
    group.provisioningSite,
    group.searchable,
    description,
  );
};

export const syncAzureGroup = (group, withPhoto) => async (dispatch, getState) => {
  await API(getState()).azure.syncGroups(group.id, withPhoto);
};

export const setBusinessGroup = (group) => async (dispatch, getState) => {
  await API(getState()).groups.updateGroup(
    group.id,
    group.label,
    group.provisioningType !== "business",
    group.provisioningSite,
    group.searchable,
  );
};

export const updateGroupSite = (group, siteId) => async (dispatch, getState) => {
  await API(getState()).groups.updateGroup(
    group.id,
    group.label,
    group.provisioningType,
    siteId,
    group.searchable,
  );
};

export const createIMChannel = (group) => async (dispatch, getState) => {
  await API(getState()).groups.createIMChannelGroup(group.id);
};

export const updateOptions = (group, options) => async (dispatch, getState) => {
  await API(getState()).groups.updateOptions(group.id, options);
};

export const updateContactList =
  (group, isInContactList, restrictMembers) => async (dispatch, getState) => {
    await API(getState()).groups.updateContactList(group.id, isInContactList, restrictMembers);
  };

export const deleteGroup = (group) => async (dispatch, getState) => {
  await API(getState()).groups.deleteGroup(group.id);
};

export const removeSectorFromGroup = (group, siteId, sectorId) => async (dispatch, getState) => {
  await API(getState()).groups.removeSectorFromGroup(siteId, group.id, sectorId);
};

export const addSectorToGroup = (group, siteId, sectorId) => async (dispatch, getState) => {
  await API(getState()).groups.addSectorToGroup(siteId, group.id, sectorId);
};

export const updateFeatureConfig = (group, featureConfig) => async (dispatch, getState) => {
  await API(getState()).groups.updateFeatureConfig(group.id, featureConfig);
};

export const addUsersToGroup = (group, userIds) => async (dispatch, getState) => {
  await API(getState()).groups.addUsersToGroup(group.id, userIds);
};

export const createGroup =
  ({
    type,
    displayName,
    externalId,
    tenantName,
    provisioningType = "security",
    provisioningSite,
    createIMChannel = false,
  }) =>
  async (dispatch, getState) => {
    return await API(getState()).groups.addGroup(
      type,
      externalId,
      displayName,
      tenantName,
      provisioningType,
      provisioningSite,
      createIMChannel,
      false,
    );
  };

export const publishIMMessage = (group, message, type) => async (dispatch, getState) => {
  const state = getState();

  const messages = await API(state).groups.publishMessageInChannelGroup(group.id, message, type);
  return messages;
};

export const updateIMMessage = (group, messageId, message, type) => async (dispatch, getState) => {
  const state = getState();

  await API(state).groups.updateMessageInChannelGroup(group.id, messageId, message, type);
};

export const listMessages = (group) => async (dispatch, getState) => {
  const state = getState();

  const result = await API(state).groups.listIMChannelMessages(group.id);

  const msg = result.map((msg) => ({
    ...msg,
    createdAt: dayjs(msg.createdAt).local().format("DD/MM/YYYY HH:mm"),
    updatedAt: msg.updatedAt ? dayjs(msg.updatedAt).local().format("DD/MM/YYYY HH:mm") : "",
  }));

  return msg;
};

export default slice.reducer;
