import { useState } from "react";
import { TwitterPicker } from "react-color";

const ColorSelector = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color) => {
    setIsOpen(false);
    onChange(color.hex);
  };

  const handleBoxClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        style={{
          width: "25px",
          height: "25px",
          backgroundColor: value,
          cursor: "pointer",
        }}
        onClick={handleBoxClick}
      ></div>
      {isOpen && (
        <div style={{ position: "absolute", zIndex: 10000, left: -244, top: 40, width: "150px" }}>
          <TwitterPicker
            color={value}
            onChange={handleColorChange}
            triangle="top-right"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
