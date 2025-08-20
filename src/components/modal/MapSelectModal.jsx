/* eslint-disable react-refresh/only-export-components */

import  { useEffect, useState } from "react";
import { Input, Modal, Row,  } from "antd";
import GoogleMapReact from "google-map-react";
import { AimOutlined } from "@ant-design/icons";
import useDesignTokens from "@/hook/useDesignTokens";
import { useTranslation } from "react-i18next";

const googleMapKey = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapSelectModal = ({
  isVisible,
  setIsVisible,
  promiseResolve,
  initialPoint,
  initialAddress,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [point, setPoint] = useState({ lat: 59.95, lng: 30.33 });

  const { colors } = useDesignTokens();
  const { t } = useTranslation();

  const POI = () => (
    <AimOutlined style={{ fontSize: "32px", color: colors.secondary_base }} />
  );

  useEffect(() => {
    if (isVisible) {
      setPoint(initialPoint);
      setAddress(initialAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleOk = () => {
    setIsVisible(false);
    promiseResolve({ ...point, address });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleMapClick = ({ lat, lng }) => {
    // Update the center of the map
    setPoint({ lat, lng });
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleCancel}
      onOk={handleOk}
      okButtonProps={{ disabled: !address || address.length === 0 }}
    >
      <Row style={{ marginBottom: "10px", marginTop: "10px" }}>
        <Input
          placeholder={t("choose-address")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const geocoder = new window.google.maps.Geocoder();

              geocoder.geocode({ address }, (results, status) => {
                if (status === "OK") {
                  setPoint({
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                  });
                }
              });
            }
          }}
        />
      </Row>

      <div style={{ height: "400px", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: googleMapKey }}
          center={point}
          defaultZoom={15}
          onClick={handleMapClick}
        >
          <POI lat={point.lat} lng={point.lng} name="adb" />
        </GoogleMapReact>
      </div>
      <div>{address}</div>
    </Modal>
  );
};

export default MapSelectModal;

export const useMapSelectModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ lat: 59.95, lng: 30.33 });
  const [address, setAddress] = useState("");
  const [promiseResolve, setPromiseResolve] = useState(null);

  const selectOnMap = ({ lat, lng, address }) => {
    setPosition({ lat, lng });
    setAddress(address);
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    selectOnMap,
    // eslint-disable-next-line react/jsx-key
    <MapSelectModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      initialPoint={position}
      initialAddress={address}
    />,
  ];
};
