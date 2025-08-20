/* eslint-disable no-console */
import config from "./config";

const LOG_STYLES = [
  "background-color: #d3eeff",
  "color: #2675a6",
  "padding: 2px",
  "border-radius: 2px",
  "border: 1px solid #2675a6",
].join("; ");

const DEBUG = config.showLog;

const logger = {
  log: DEBUG ? console.log.bind(console, "%cSwiziLog%c", LOG_STYLES, "") : () => {},
  warn: console.warn.bind(console, "%cSwiziLog%c", LOG_STYLES, ""),
  error: console.error.bind(console, "%cSwiziLog%c", LOG_STYLES, ""),
};

window.logger = logger;

export default logger;
