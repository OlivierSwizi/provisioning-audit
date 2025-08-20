// FILENAME: src/components/AccessibleIconButton.jsx
import React from "react";
import { Button } from "antd";

/**
 * Usage:
 *  <AccessibleIconButton
 *    ariaLabel={t('users.delete', { defaultValue: 'Supprimer' })}
 *    icon={<DeleteOutlined />}
 *    onClick={...}
 *  />
 */
export default function AccessibleIconButton({ ariaLabel, ...rest }) {
  return <Button aria-label={ariaLabel} {...rest} />;
}
