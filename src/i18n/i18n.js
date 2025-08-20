import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import languages from "./lang";
import config from "../config";

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    react: {
      useSuspense: false,
    },
    resources: languages,
    fallbackLng: "fr",
    debug: config.showLog,
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });
