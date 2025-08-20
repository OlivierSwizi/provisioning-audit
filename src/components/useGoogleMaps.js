import { useEffect, useState } from "react";
const googleMapKey = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function useGoogleMaps() {
  const [googleMaps, setGoogleMaps] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.addEventListener("load", () => {
      setGoogleMaps(window.google.maps);
    });
  }, []);

  return googleMaps;
}

export default useGoogleMaps;
