/* eslint-disable react-refresh/only-export-components */

import { useMapSelectModal } from "@/components/modal/MapSelectModal";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { Modal, Form, Typography, Input } from "antd";
import { useForm } from "antd/lib/form/Form";

const { Text } = Typography;
const googleMapKey = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const EditPlaceModal = ({ place, isVisible, setIsVisible, promiseResolve }) => {
  const [form] = useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      form.setFieldsValue({
        title: place.title,
        subtitle: place.subtitle,
        phone: place.phone,
        website: place.website,
        location: {
          lat: place.lat,
          lon: place.lon,
          address: place.address,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleFieldsChange = () => {};

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = (values) => {
    setIsVisible(false);
    promiseResolve({
      title: values.title,
      subtitle: values.subtitle,
      phone: values.phone,
      website: values.website,
      lat: values.location.lat,
      lon: values.location.lon,
      address: values.location.address,
    });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const MapImage = ({ value, onChange }) => {
    const [url, setUrl] = useState(null);
    const [selectOnMap, MapSelectModal] = useMapSelectModal({ lat: 59.95, lng: 30.33 });

    useEffect(() => {
      if (!value) return;
      const markerString = `markers=color:red%7C${value.lat},${value.lon}`;

      setUrl(
        `https://maps.googleapis.com/maps/api/staticmap?center=${value.lat},${
          value.lon
        }&${markerString}&zoom=14&size=${100}x${100}&markers=color:red&key=${googleMapKey}`,
      );
    }, [value]);

    const onClick = async () => {
      let newValue = await selectOnMap({
        lat: value.lat,
        lng: value.lon,
        address: value.address,
      });

      onChange({
        lat: newValue.lat,
        lon: newValue.lng,
        address: newValue.address,
      });
    };

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div> {MapSelectModal}</div>
        <Text>{value?.address || ""}</Text>
        <img onClick={onClick} style={{ cursor: "pointer", width: "100px" }} src={url} alt="map" />
      </div>
    );
  };

  return (
    <Modal open={isVisible} onOk={handleOk} onCancel={handleCancel}>
      <Form
        form={form}
        onFieldsChange={handleFieldsChange}
        onFinish={handleFinish}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          offset: 1,
          span: 14,
        }}
        layout="horizontal"
      >
        <MultiLineFormItem label={t("features-aroundme.am-place-title")} name="title">
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem label={t("features-aroundme.am-place-subtitle")} name="subtitle">
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem label={t("features-aroundme.am-place-phone")} name="phone">
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem label={t("features-aroundme.am-place-website")} name="website">
          <Input autoComplete="off" />
        </MultiLineFormItem>

        <MultiLineFormItem label={t("features-aroundme.am-place-location")} name="location">
          <MapImage />
        </MultiLineFormItem>
      </Form>
    </Modal>
  );
};

export default EditPlaceModal;

export const useEditPlaceModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [place, setPlace] = useState();
  const [promiseResolve, setPromiseResolve] = useState(null);

  const editPlace = (placeToEdit) => {
    setIsVisible(true);
    setPlace(placeToEdit);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    editPlace,

    <EditPlaceModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      place={place}
    />,
  ];
};
