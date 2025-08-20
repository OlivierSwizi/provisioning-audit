import { Button, Card, Result, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";

const { Paragraph } = Typography;

const LoginFailed = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card style={{ width: 400, textAlign: "center" }} bordered={false}>
        <Result
          status={403}
          title={t("login-error-title")}
          subTitle={t("login-error-subtitle")}
          extra={[
            <Button
              block
              type="primary"
              key="console"
              onClick={() => {
                auth.signinRedirect();
              }}
            >
              {t("login-error-button")}
            </Button>,
          ]}
        />
        <Typography style={{ marginTop: "20px" }}>
          <Paragraph>
            {t("contact-support") + " "}
            <a href="mailto:support@swizi.io">support@swizi.io</a>.
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default LoginFailed;
