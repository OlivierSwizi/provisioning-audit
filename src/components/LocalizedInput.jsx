import { Button, Checkbox, Divider, Tabs } from "antd";
import { useEffect, useState } from "react";

const LocalizedInput = ({
  value,
  onChange,
  options = { keyLocale: "lang", keyContent: "content" },
}) => {
  const [currentValue, setCurrentValue] = useState([]);
  const [selectedLocale, setSelectedLocale] = useState();

  useEffect(() => {
    if (!value) {
      currentValue = [
        {
          [options.keyLocale || "locale"]: "fr",
          [options.keyContent || "content"]: "",
        },
      ];
    } else currentValue = value;

    if (
      !selectedLocale ||
      currentValue.findIndex((v) => v[options.keyLocale] === selectedLocale) === -1
    ) {
      setSelectedLocale(currentValue[0][options.keyLocale]);
    }
    setCurrentValue(currentValue);
  }, [value, options.keyLocale, options.keyContent]);

  const handleLocaleChange = (locale) => {
    setSelectedLocale(locale);
  };

  const handleContentChange = (content) => {
    const updatedValue = currentValue.map((item) => {
      if (item[options.keyLocale] === selectedLocale) {
        return { ...item, [options.keyContent]: content };
      }
      return item;
    });
    setCurrentValue(updatedValue);
    onChange(updatedValue);
  };

  const handleAddLocale = () => {
    const newLocale = `lang-${currentValue.length + 1}`;
    const newItem = {
      [options.keyLocale || "locale"]: newLocale,
      [options.keyContent || "content"]: "",
    };
    const updatedValue = [...currentValue, newItem];
    setCurrentValue(updatedValue);
    setSelectedLocale(newLocale);
    onChange(updatedValue);
  };

  const handleRemoveLocale = (locale) => {
    const updatedValue = currentValue.filter((item) => item[options.keyLocale] !== locale);
    setCurrentValue(updatedValue);
    if (selectedLocale === locale && updatedValue.length > 0) {
      setSelectedLocale(updatedValue[0][options.keyLocale]);
    } else if (updatedValue.length === 0) {
      setSelectedLocale(undefined);
    }
    onChange(updatedValue);
  };

  return (
    <Tabs
      activeKey={selectedLocale}
      onChange={handleLocaleChange}
      type="editable-card"
      hideAdd
      onEdit={(targetKey, action) => {
        if (action === "add") {
          handleAddLocale();
        } else if (action === "remove") {
          handleRemoveLocale(targetKey);
        }
      }}
    >
      {currentValue.map((item) => (
        <Tabs.TabPane
          tab={
            <span>
              {item[options.keyLocale]}{" "}
              <Button
                type="text"
                danger
                onClick={() => handleRemoveLocale(item[options.keyLocale])}
              >
                x
              </Button>
            </span>
          }
          key={item[options.keyLocale]}
        >
          <textarea
            value={item[options.keyContent]}
            onChange={(e) => handleContentChange(e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
};

export default LocalizedInput;
