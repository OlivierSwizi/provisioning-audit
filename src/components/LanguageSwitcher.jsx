// FILENAME: src/components/LanguageSwitcher.jsx
import React from "react";
import PropTypes from "prop-types";
import { Dropdown, Button, Space } from "antd";
import { GlobalOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ size, showLabel }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "en";

  const change = (lng) => {
    if (!lng || lng === current) return;
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("lang", lng);
    } catch {
      /* noop */
    }
  };

  const items = [
    {
      key: "fr",
      label: (
        <Space>
          🇫🇷 <span>Français</span>
        </Space>
      ),
      onClick: () => change("fr"),
    },
    {
      key: "en",
      label: (
        <Space>
          🇬🇧 <span>English</span>
        </Space>
      ),
      onClick: () => change("en"),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button size={size} icon={<GlobalOutlined />}>
        {showLabel ? (current === "fr" ? "Français" : "English") : null}
        {showLabel ? <DownOutlined style={{ marginInlineStart: 6 }} /> : null}
      </Button>
    </Dropdown>
  );
}

LanguageSwitcher.propTypes = {
  size: PropTypes.oneOf(["small", "middle", "large"]),
  showLabel: PropTypes.bool,
};

LanguageSwitcher.defaultProps = {
  size: "small",
  showLabel: true,
};
