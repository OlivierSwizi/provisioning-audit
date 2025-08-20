import { useTranslation } from "react-i18next";
import { isNil, pickAll } from "ramda";
import {
  Row,
  Col,
  Button,
  message,
  Form,
  Typography,
  Select,
  Result,
  Tabs,
  Input,
  Checkbox,
  Space,
  Flex,
} from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";

import logger from "@/logger";
import PlaceSelector from "@/components/PlaceSelector";
import TimezoneSelector from "@/components/TimezoneSelector";
import OpeningHoursSelector from "@/components/OpeningHoursSelector";
import EquipmentList from "@/components/EquipmentList";
import RichEditor from "@/components/RichEditor";
import MediaSelector from "@/components/MediaSelector";
import ServiceList from "@/components/ServiceList";

// create a new component for activable input usable in the form. The component contains a checkbox to activate or deactivate the input. if input value is null or undefined, the checkbox is unchecked and the input is disabled. if input value is not null or undefined, the checkbox is checked and the input is enabled. if checkbox is unchecked, the input value is set to null or undefined.
const ActivableInput = ({ value, onChange, ...props }) => {
  const [isActive, setIsActive] = useState(!isNil(value));

  useEffect(() => {
    setIsActive(!isNil(value));
  }, [value]);

  const handleCheckboxChange = (e) => {
    setIsActive(e.target.checked);
    onChange(e.target.checked ? value || "" : null);
  };

  return (
    <Form.Item>
      <Flex align="left" gap="20px">
        <Checkbox checked={isActive} onChange={handleCheckboxChange}>
          {props.label}
        </Checkbox>
        <Input
          {...props}
          disabled={!isActive}
          value={isActive ? value : undefined}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          style={{ maxWidth: "300px" }}
        />
      </Flex>
    </Form.Item>
  );
};

const PlacesView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);
  const [placesId, setPlacesId] = useState(null);
  const [placesList, setPlacesList] = useState([]);
  const [placeIsError, setPlaceIsError] = useState(false);
  const [useOpeningHours, setUseOpeningHours] = useState(false);
  const [localeList, setLocaleList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [contentId, setContentId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const loadConfig = async () => {
    let config;
    try {
      await dispatch(startWorking());
      config = await api.features.places.list(siteId);
      setPlacesList(config);
      if (config.length > 0) {
        const previousSelectionIdx = placesList.findIndex((p) => p.id === placesId);
        if (previousSelectionIdx !== -1) {
          setSelectedPlace(config[previousSelectionIdx]);
          setPlacesId(config[previousSelectionIdx].id);
        } else {
          setPlacesId(config[0].id);
          setSelectedPlace(config[0]);
        }
      } else {
        setPlacesId(null);
        setSelectedPlace(null);
      }
    } catch (e) {
      logger.error(e);
      message.error(t("audience.load-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  useEffect(() => {
    if (!appId || !siteId) return;

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  useEffect(() => {
    if (!placesId || !contentId) return;

    const place = placesList.find((p) => p.id === placesId);
    if (place) {
      const content = place.content.find((c) => c.id === contentId);
      form.setFieldsValue(
        pickAll(
          ["location", "localized", "openingHours", "timeZone", "phone", "email"],
          content.config.data,
        ),
      );
      form.setFieldValue("headerMediaId", content.headerMediaId);
      setLocaleList(content.config.data.localized.map((l) => l.locale));
      setUseOpeningHours(content.config.data.openingHours?.length > 0);
    } else {
      form.resetFields();
    }
  }, [contentId, form, placesId, placesList]);

  useEffect(() => {
    if (!placesId) return setContentId(null);
    const selectedPlace = placesList.find((p) => p.id === placesId);
    setSelectedPlace(selectedPlace);
    setContentId(selectedPlace?.content?.length > 0 ? selectedPlace.content[0].id : null);
  }, [placesId, placesList]);

  useEffect(() => {
    if (
      useOpeningHours &&
      form &&
      (!form.getFieldValue("openingHours") || form.getFieldValue("openingHours").length === 0)
    ) {
      form.setFieldsValue({
        openingHours: [[], [], [], [], [], [], []],
      });
    } else if (!useOpeningHours) {
      form.setFieldsValue({
        openingHours: [],
      });
    }
  }, [useOpeningHours, form]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());

      const data = form.getFieldsValue();
      if (!useOpeningHours) {
        data.openingHours = [];
      }
      await api.features.places.update(siteId, placesId, contentId, data);

      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.log(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }

    loadConfig();
  };

  const PlaceContent = ({ index }) => {
    return (
      <Row>
        <Col span={24}>
          <Form.Item hidden name={["localized", index, "locale"]} />
          <Form.Item hidden name={["localized", index, "extras"]} />
          <Form.Item label={t("features-places.places-name")} name={["localized", index, "name"]} required>
            <Input autoComplete="off" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t("features-places.places-description")} name={["localized", index, "others"]}>
            <RichEditor />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t("features-places.places-equipments")} name={["localized", index, "equipments"]}>
            <EquipmentList />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t("features-places.places-services")} name={["localized", index, "services"]}>
            <ServiceList />
          </Form.Item>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Typography.Title level={2}>{t("features-places.places-settings")}</Typography.Title>
        </Col>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={4}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="medium"
                style={{ width: "250px", marginBottom: "25px" }}
                allowClear={false}
              />
            </Col>
            {placesList.length > 0 ? (
              <Col offset={1} span={4}>
                <Select
                  value={placesId}
                  onChange={setPlacesId}
                  size="medium"
                  style={{ width: "250px", marginBottom: "25px" }}
                  options={placesList.map((place) => ({
                    label: place.name,
                    value: place.id,
                  }))}
                />
              </Col>
            ) : (
              <Col offset={1} span={4} />
            )}
            {placesList.length > 0 ? (
              <Col offset={1} span={4}>
                <Select
                  value={contentId}
                  onChange={setContentId}
                  size="medium"
                  style={{ width: "250px", marginBottom: "25px" }}
                  options={
                    selectedPlace?.content?.map((c) => ({
                      label: c.config.data.localized[0]?.name || c.id,
                      value: c.id,
                    })) || []
                  }
                />
              </Col>
            ) : (
              <Col offset={1} span={4} />
            )}

            <Col offset={3} span={4}>
              <Button block type="primary" onClick={handleSave}>
                {t("components.save")}
              </Button>
            </Col>
            {placesList.length > 0 ? (
              <Row style={{ width: "100%" }}>
                <Col span={24} style={{ marginTop: 5, marginBottom: 10 }}>
                  <Space size="middle">
                    <span>
                      <Typography.Text strong>{t("features-places.section-id")} : </Typography.Text>
                      <Typography.Text copyable>{placesId}</Typography.Text>
                    </span>
                    <span>
                      <Typography.Text strong>{t("features-places.content-id")} : </Typography.Text>
                      <Typography.Text copyable>{contentId}</Typography.Text>
                    </span>
                  </Space>
                </Col>
                <Col span={24} style={{ marginTop: "50px" }}>
                  <Form
                    form={form}
                    onFinish={handleSave}
                    onError={() => {}}
                    labelCol={{
                      span: 3,
                    }}
                    wrapperCol={{
                      offset: 1,
                      span: 17,
                    }}
                    layout="horizontal"
                  >
                    <Row style={{ marginBottom: 20 }}>
                      <Col span={24}>
                        <Form.Item label={t("features-places.places-header")} name="headerMediaId">
                          <MediaSelector />
                        </Form.Item>
                        <Form.Item
                          label={t("features-places.places-location")}
                          name="location"
                          validateStatus={placeIsError ? "error" : "success"}
                        >
                          <PlaceSelector siteId={siteId} onError={setPlaceIsError} />
                        </Form.Item>
                        <Form.Item label={t("features-places.timezone")} name="timeZone">
                          <TimezoneSelector />
                        </Form.Item>
                        <Col offset={4} span={8} style={{ marginBottom: 15 }}>
                          <Checkbox
                            checked={useOpeningHours}
                            onChange={(e) => setUseOpeningHours(e.target.checked)}
                          >
                            {t("features-places.show-opening-hours")}
                          </Checkbox>
                        </Col>
                        <Form.Item
                          label={t("features-places.opening-hours")}
                          name="openingHours"
                          hidden={!useOpeningHours}
                        >
                          <OpeningHoursSelector />
                        </Form.Item>
                        <Form.Item label={t("features-places.places-phone")} name="phone">
                          <ActivableInput />
                        </Form.Item>
                        <Form.Item label={t("features-places.places-email")} name="email">
                          <ActivableInput />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Tabs
                          activeKey={String(activeTab)}
                          onChange={(key) => setActiveTab(Number(key))}
                          items={localeList.map((l, idx) => ({
                            label: l,
                            key: idx,
                            children: null, // children rendered below
                          }))}
                        />
                        {localeList.map((l, idx) => (
                          <div key={l} style={{ display: activeTab === idx ? "block" : "none" }}>
                            <PlaceContent index={idx} />
                          </div>
                        ))}
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            ) : (
              <Col span={24}>
                <Result status="404" title={t("features-places.no-places-found")} subTitle={""} />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default PlacesView;
