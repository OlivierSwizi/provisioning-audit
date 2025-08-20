import PropTypes from "prop-types";
import { Button, Result, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const { Paragraph } = Typography;

const NotFound = ({ title, subtitle, messageDetail }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      <Result
        status="404"
        title={title}
        subTitle={subtitle}
        extra={
          <>
            <Paragraph style={{ maxWidth: "600px", textAlign: "center" }}>
              {messageDetail}
            </Paragraph>
            <Button type="primary" onClick={handleGoBack}>
              {t("components.returnToPreviousPage")}
            </Button>
          </>
        }
      />
    </div>
  );
};

NotFound.propTypes = {
  messageDetail: PropTypes.string.isRequired,
};

export default NotFound;
