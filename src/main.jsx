import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import DayJSTimezone from "dayjs/plugin/timezone";
import DayJSUtc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/antd.scss";
import "./styles/fonts";
import "./styles/index.scss";

dayjs.extend(localizedFormat);
dayjs.extend(DayJSUtc);
dayjs.extend(DayJSTimezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const root = createRoot(document.getElementById("root"));
root.render(<App />);
