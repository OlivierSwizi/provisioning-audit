import { useEffect, useState } from "react";
const googleMapKey = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapImage = ({ value, onChange, style = {} }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!value) return;
    const markerString = `markers=color:red%7C${value.lat},${value.lon}`;

    setUrl(
      `https://maps.googleapis.com/maps/api/staticmap?center=${value.lat},${
        value.lon
      }&${markerString}&zoom=14&size=${100}x${100}&scale=2&markers=color:red&key=${googleMapKey}`,
    );
  }, [value]);

  return (
    <img
      onClick={(v) => {
        if (onChange) onChange(v);
      }}
      style={{ ...style, cursor: "pointer" }}
      src={url}
      alt="map"
    />
  );
};

export default MapImage;
