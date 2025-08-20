import { StyleProvider } from "@ant-design/cssinjs";
import { App as AntApp, ConfigProvider, theme } from "antd";
import enUS from "antd/lib/locale/en_US";
import frFR from "antd/lib/locale/fr_FR";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import moment from "moment";
import "moment/locale/fr";
import { compose } from "ramda";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Provider } from "react-redux";
import { colors, shadows, symbols } from "./assets/token/designToken";
import "./i18n/i18n";
import LoginLayout from "./layout/LoginLayout";
import logger from "./logger";
import store from "./services/redux/configureStore";

const antLocales = {
  fr: frFR,
  en: enUS,
};

/**
 * @type {import("antd/es/config-provider/context").ThemeConfig}
 */
const antTheme = {
  cssVar: true,
  token: {
    // Seed tokens
    colorPrimary: colors.primary_base,
    colorInfo: colors.highlight_light,
    colorSuccess: colors.success_light,
    // colorWarning: colors.success_light,
    colorError: colors.error_light,
    borderRadius: symbols.base_shape.radius,
    colorLink: colors.primary_base,
    lineWidth: 2,

    // Map tokens
    colorBgLayout: colors.light_background,

    // Alias tokens
    boxShadow: `${shadows.x}px ${shadows.y}px ${shadows.blur}px ${shadows.color}`,
    boxShadowSecondary: `${shadows.x}px ${shadows.y}px ${shadows.blur}px ${shadows.color}`,
    boxShadowTertiary: `${shadows.x}px ${shadows.y}px ${shadows.blur}px ${shadows.color}`,
  },
  components: {
    Avatar: {
      colorBorder: "white",
      colorTextPlaceholder: colors.primary_base,
    },
    Card: {
      lineWidth: 0,
      borderRadius: symbols.base_shape.radius,
      borderRadiusXS: symbols.base_shape.radius,
      borderRadiusSM: symbols.base_shape.radius,
      borderRadiusLG: symbols.base_shape.radius,
      borderRadiusOuter: symbols.base_shape.radius,
    },
    Menu: {
      lineWidth: 0,
      itemSelectedColor: colors.secondary_base,
      itemSelectedBg: colors.grey_20,
    },
    Button: {
      borderRadius: symbols.button_shape.radius,
      borderRadiusXS: symbols.button_shape.radius,
      borderRadiusSM: symbols.button_shape.radius,
      borderRadiusLG: symbols.button_shape.radius,
      defaultColor: colors.primary_base,
      defaultBorderColor: colors.primary_base,
      defaultShadow: "none",
      primaryShadow: "none",
      boxShadowSecondary: "none",
      boxShadowTertiary: "none",
      dangerShadow: "none",
      fontWeight: "bold",
      algorithm: true,
    },
    Tag: {
      borderRadius: 999,
      borderRadiusXS: 999,
      borderRadiusSM: 999,
      borderRadiusLG: 999,
      algorithm: true,
    },
    Tabs: {
      colorPrimary: colors.secondary_base,
      algorithm: true,
    },
    Segmented: {
      colorBgBase: colors.grey_20,
    },
  },
};

const withAntd = (Component) => {
  const WrappedComponent = (props) => {
    return (
      <ConfigProvider theme={antTheme} componentSize={"middle"} locale={antLocales["fr"]}>
        <StyleProvider layer>
          <AntApp>
            <Component {...props} />
          </AntApp>
        </StyleProvider>
      </ConfigProvider>
    );
  };
  WrappedComponent.displayName = `withAntd(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

const withRedux = (Component) => {
  const WrappedComponent = (props) => {
    return (
      <Provider store={store}>
        <Component {...props} />
      </Provider>
    );
  };
  WrappedComponent.displayName = `withRedux(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

const App = () => {
  const { i18n } = useTranslation();
  const lng = i18n.language.split("-")[0];
  const dt = theme.useToken();

  logger.log("App", "i18n.language", i18n.language);

  useEffect(() => {
    moment.locale(lng);
    dayjs.locale(lng);
  }, [lng]);

  logger.log("App", "theme", Object.assign({}, dt.token, colors));

  return <LoginLayout />;
};

const EnhancedApp = compose(withAntd, withRedux)(App);
export default EnhancedApp;
