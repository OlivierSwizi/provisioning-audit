import { User, WebStorageStateStore } from "oidc-client-ts";

const normalizeUrl = (url) => url.replace(/([^:]\/)\/+/g, "$1");

const keycloak = {
  url: import.meta.env.REACT_APP_KEYCLOAK_ENDPOINT,
  realm: import.meta.env.REACT_APP_KEYCLOAK_REALM,
  clientId: import.meta.env.REACT_APP_KEYCLOAK_CLIENT_ID,
};

const store = new WebStorageStateStore({ store: window.localStorage });

/** @type {import("react-oidc-context").AuthProviderProps} */
export const oidcConfig = {
  authority: normalizeUrl(`${keycloak.url}/realms/${keycloak.realm}`),
  client_id: keycloak.clientId,
  redirect_uri: normalizeUrl(
    `${import.meta.env.REACT_APP_ENDPOINT}/provisioning/redirectAuth?${new URLSearchParams({
      type: import.meta.env.REACT_APP_AUTH_TYPE,
    })}`,
  ),
  scope: "openid profile email offline_access",
  post_logout_redirect_uri: `${import.meta.env.REACT_APP_ENDPOINT}/provisioning/redirectLogout?${new URLSearchParams(
    {
      type: import.meta.env.REACT_APP_AUTH_TYPE,
    },
  )}`,
  response_type: "code",
  loadUserInfo: true,
  automaticSilentRenew: true,
  monitorSession: true,
  userStore: store,
  onSigninCallback: async () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export const getUser = () => {
  const storageKey = `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;
  const s = localStorage.getItem(storageKey);
  return s ? User.fromStorageString(s) : null;
};

export const getAccessToken = () => {
  const user = getUser();
  return user?.access_token;
};
