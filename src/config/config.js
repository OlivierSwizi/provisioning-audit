const config = {
  version: import.meta.env.REACT_APP_VERSION,
  isLocal: import.meta.env.REACT_APP_IS_LOCAL === "true",
  endpoint:
    import.meta.env.REACT_APP_IS_LOCAL === "true" ? "/api" : import.meta.env.REACT_APP_ENDPOINT,
  showLog: import.meta.env.REACT_APP_DEBUG === "true",
  languages: ["fr", "en"],
  withInlineHelp: import.meta.env.REACT_APP_WITH_INLINE_HELP === "true",
};

export default config;
