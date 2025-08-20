// FILENAME: src/components/TopbarLink.jsx
import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

export default function TopbarLink({ icon, children, onClick }) {
  return (
    <Button
      type="text"
      icon={icon}
      onClick={onClick}
      style={{
        color: "#1A5274",
        fontWeight: 500,
        fontSize: 14,
        paddingInline: 12,
      }}
      className="topbar-link"
    >
      {children}
    </Button>
  );
}

TopbarLink.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
};
