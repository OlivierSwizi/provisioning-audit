// FILENAME: src/views/Errors/GenericError.jsx
import React from "react";
import PropTypes from "prop-types";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";

export default function GenericError({ title = "Erreur", message, onRetry }) {
  const { t } = useTranslation();
  return (
    <Result
      status="error"
      title={title}
      subTitle={message || t("errors.generic")}
      extra={
        onRetry ? (
          <Button type="primary" onClick={onRetry}>
            {t("errors.retry")}
          </Button>
        ) : null
      }
    />
  );
}

GenericError.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
};
