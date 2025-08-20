import LoginFailed from "@/views/Errors/LoginFailed";
import { Card, Spin, Typography } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { AuthProvider, hasAuthParams, useAuth } from "react-oidc-context";

import { oidcConfig } from "@/oidc";
import router from "./router";
import { postAuthent } from "@/services/features/AuthSlice";

const { Title, Paragraph } = Typography;

const GOOGLE_MAP_API_KEY = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const GOOGLE_MAP_LIBRARIES = ["places"];

const InitializationScreen = ({ task }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f2f4f5",
      }}
    >
      <Card bordered={false} style={{ width: 400, textAlign: "center" }}>
        <Spin size="large" />
        <Typography style={{ marginTop: "20px" }}>
          <Title level={3}>{t(task)}...</Title>
          <Paragraph>{t("please-wait")}</Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

const HomeSwitch = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const { ready } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      // Déclenche la redirection vers Keycloak
      auth.signinRedirect();
    }

    if (auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      // Si l'utilisateur est authentifié, on peut charger les données nécessaires
      dispatch(postAuthent());
    }
  }, [auth, dispatch]);

  if (auth.activeNavigator === "signinSilent")
    return <InitializationScreen task="authenticating" />;
  if (auth.activeNavigator === "signoutRedirect")
    return <InitializationScreen task="logging-out" />;
  if (auth.isLoading) return <InitializationScreen task="loading" />;
  if (auth.error) return <LoginFailed />;
  if (!auth.isAuthenticated) return <InitializationScreen task="authent-redirect" />;

  if (!ready) return <InitializationScreen task="loading" />;

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY} libraries={GOOGLE_MAP_LIBRARIES}>
      <RouterProvider router={router} />
    </LoadScript>
  );
};

const LoginLayout = () => {
  return (
    <AuthProvider {...oidcConfig}>
      <HomeSwitch />
    </AuthProvider>
  );
};

export default LoginLayout;
