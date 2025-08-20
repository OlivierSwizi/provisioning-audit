import { Button, Card, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Card style={{ width: 400, textAlign: "center" }} bordered={false}>
        <Result
          status="404"
          title="404"
          subTitle={t("errors.404-subtitle")}
          extra={
            <Button block onClick={() => navigate("/")} type="primary">
              {t("errors.404-redirect")}
            </Button>
          }
        />
      </Card>
    </div>
  );
};

export default NotFound;
