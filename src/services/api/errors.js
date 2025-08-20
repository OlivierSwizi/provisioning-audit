// FILENAME: src/services/api/errors.js

/**
 * isNetworkError
 * - Timeout, offline, DNS, CORS bloquant, AbortController…
 * - En Axios: error.code === 'ECONNABORTED' ou pas de error.response
 */
export function isNetworkError(error) {
  if (!error) return false;
  if (error.code === "ECONNABORTED") return true;
  if (!error.response) return true;
  return false;
}

/**
 * httpStatusToKey
 * - Map HTTP → clé i18n (libre à toi de brancher i18next)
 * - Tu peux enrichir à mesure (401, 403, 409, 422…)
 */
export function httpStatusToKey(status) {
  switch (status) {
    case 400:
      return "errors.badRequest";
    case 401:
      return "errors.unauthorized";
    case 403:
      return "errors.forbidden";
    case 404:
      return "errors.notFound";
    case 409:
      return "errors.conflict";
    case 422:
      return "errors.unprocessable";
    case 500:
      return "errors.server";
    case 503:
      return "errors.unavailable";
    default:
      return "errors.http";
  }
}

/**
 * extraireMessageServeur
 * - Cherche un message « utile » dans la payload backend (format libre)
 */
function extraireMessageServeur(data) {
  if (!data) return null;
  // cas fréquents: { message } | { error } | { detail } | { errors: [...] }
  if (typeof data === "string") return data;
  return (
    data.message ||
    data.error ||
    data.detail ||
    (Array.isArray(data.errors) && data.errors[0]?.message) ||
    null
  );
}

/**
 * normalizeAxiosError(err)
 * - Transforme une erreur Axios en objet stable pour l’UI
 * - Ne dépend pas d’i18next/AntD; laisse l’appelant choisir l’affichage
 */
export function normalizeAxiosError(err) {
  if (!err)
    return {
      message: "Unknown error",
      status: 0,
      data: null,
      isNetwork: true,
      i18nKey: "errors.unknown",
      raw: err,
    };

  const net = isNetworkError(err);
  const status = err.response?.status ?? 0;
  const data = err.response?.data ?? null;

  const serverMsg = extraireMessageServeur(data);
  const message = net
    ? "Network error"
    : serverMsg || err.message || (status ? `HTTP ${status}` : "Error");

  return {
    message,
    status,
    data,
    isNetwork: net,
    i18nKey: net ? "errors.network" : httpStatusToKey(status),
    raw: err,
  };
}

/**
 * toUserMessage
 * - Si tu veux brancher rapidement des libellés sans i18n, tu peux map ici.
 * - Sinon préfère t(err.i18nKey) côté UI.
 */
export function toUserMessage(normalized, t) {
  if (typeof t === "function") {
    return t(normalized.i18nKey, { defaultValue: normalized.message });
  }
  return normalized.message;
}
