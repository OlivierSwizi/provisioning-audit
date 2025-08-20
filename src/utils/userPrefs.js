const NAMESPACE = "prefs:";

export function getUserPref(key, fallback) {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}${key}`);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setUserPref(key, value) {
  try {
    localStorage.setItem(`${NAMESPACE}${key}`, JSON.stringify(value));
  } catch {
    // noop
  }
}

export function removeUserPref(key) {
  try {
    localStorage.removeItem(`${NAMESPACE}${key}`);
  } catch {
    // noop
  }
}

import { useState, useEffect } from "react";

export function useUserPref(key, initialValue) {
  const [value, setValue] = useState(() => getUserPref(key, initialValue));
  useEffect(() => {
    setUserPref(key, value);
  }, [key, value]);
  return [value, setValue];
}
