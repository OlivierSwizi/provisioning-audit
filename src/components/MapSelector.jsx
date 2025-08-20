import { GoogleMap, OverlayView } from "@react-google-maps/api";

function MapSelector({ value, onChange }) {
  const handleClick = async (e) => {
    onChange({ lat: e.latLng.lat(), lon: e.latLng.lng() });
  };

  if (!value?.lat || !value?.lon) return null;

  return (
    <GoogleMap
      center={{ lat: value.lat, lng: value.lon }}
      zoom={18}
      onClick={handleClick}
      mapContainerStyle={{ height: "100%" }}
    >
      <OverlayView
        position={{ lat: value.lat, lng: value.lon }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div style={{ transform: "translate(-50%, -100%)", position: "absolute" }}>
          <img
            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png"
            alt="Pin"
            style={{ width: "24px", height: "40px" }}
          />
        </div>
      </OverlayView>
    </GoogleMap>
  );
}

export default MapSelector;
