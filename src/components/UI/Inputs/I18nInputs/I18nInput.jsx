import { Input } from "antd";
import { forwardRef, useMemo } from "react";

const I18nInput = forwardRef(({ locale, value, onChange, placeholder, ...props }, ref) => {
  const _placeholder = useMemo(() => {
    return value?.["en"] || Object.values(value || {}).filter(Boolean)[0] || placeholder || "";
  }, [placeholder, value]);

  const _onChange = (e) => {
    const newValue = { ...value, [locale]: e.target.value };
    onChange(newValue);
  };

  return (
    <Input
      {...props}
      ref={ref}
      value={value?.[locale] || ""}
      onChange={_onChange}
      placeholder={_placeholder}
    />
  );
});

I18nInput.displayName = "I18nInput";

export default I18nInput;
