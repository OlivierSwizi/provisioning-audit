// FILENAME: src/components/AccessibleImage.jsx
import React from "react";
import { Image } from "antd";

/**
 * Usage:
 *  <AccessibleImage src={img} alt={t('map.plan', { defaultValue: 'Plan' })} />
 */
export default function AccessibleImage({ alt = "", ...props }) {
  return <Image alt={alt} {...props} />;
}
