import capitalize from "capitalize";

const helpers = {
  formatUserName: (user) =>
    `${(user.lastname || "").toUpperCase()} ${capitalize.words(user.firstname || "")}`,
  formatUserNameEmail: (user) =>
    `${(user.lastname || "").toUpperCase()} ${capitalize.words(user.firstname || "")} (${
      user.email
    })`,
};

export const extractLocalizedString = (obj, lang, accessor = "label") => {
  return obj.find((item) => (item.locale = lang))?.[accessor] || obj[0]?.[accessor] || "";
};

/**
 * Convertit un objet i18n de la forme:
 * {
 *   body:  { en: "English body", fr: "Body français", ... },
 *   title: { en: "English title", fr: "titre français", ... }
 * }
 * vers un tableau:
 * [
 *   { locale: "en", title: "English title", content: "English body" },
 *   { locale: "fr", title: "titre français", content: "Body français" },
 *   ...
 * ]
 *
 * - Inclut toutes les locales présentes dans body OU title.
 * - Manquants => chaîne vide (""), pour éviter undefined.
 */
export const i18nObjectToArray = (data) => {
  if (!data || typeof data !== "object") {
    throw new TypeError("i18nObjectToArray: 'data' must be an object");
  }
  const body = data.body || {};
  const title = data.title || {};

  const locales = Array.from(new Set([...Object.keys(body), ...Object.keys(title)])).sort();

  return locales.map((locale) => ({
    locale,
    title: title[locale] ?? "",
    content: body[locale] ?? "",
  }));
};

/**
 * Convertit un tableau de la forme:
 * [
 *   { locale: "en", title: "English title", content: "English body" },
 *   { locale: "fr", title: "titre français", content: "Body français" },
 *   ...
 * ]
 * vers un objet i18n:
 * {
 *   body:  { en: "English body", fr: "Body français", ... },
 *   title: { en: "English title", fr: "titre français", ... }
 * }
 *
 * - Ignore les entrées sans 'locale'.
 * - title/content manquants => chaîne vide ("").
 */
export const i18nArrayToObject = (arr) => {
  if (!Array.isArray(arr)) {
    throw new TypeError("i18nArrayToObject: 'arr' must be an array");
  }

  const body = {};
  const title = {};

  for (const item of arr) {
    if (!item || typeof item !== "object" || !item.locale) continue;
    const { locale } = item;
    title[locale] = item.title ?? "";
    body[locale] = item.content ?? "";
  }

  return { body, title };
};

/* -----------------------------------------
   Exemples d'utilisation (commentés) :

const src = {
  body:  { en: "English body", fr: "Body français" },
  title: { en: "English title", fr: "titre français" }
};

const asArray = i18nObjectToArray(src);
// [
//   { locale: "en", title: "English title", content: "English body" },
//   { locale: "fr", title: "titre français", content: "Body français" }
// ]

const backToObject = i18nArrayToObject(asArray);
// {
//   body:  { en: "English body", fr: "Body français" },
//   title: { en: "English title", fr: "titre français" }
// }
------------------------------------------ */

export default helpers;
