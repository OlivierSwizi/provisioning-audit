// FILENAME: src/utils/withSuspense.jsx
import React, { Suspense } from "react";

export default function withSuspense(Component, { fallback = null } = {}) {
  return (props) => (
    <Suspense fallback={fallback || <div style={{ padding: 16 }}>Chargement…</div>}>
      <Component {...props} />
    </Suspense>
  );
}
