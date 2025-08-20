import { useTranslation } from "react-i18next";
import { Row, Col, Button, Input, message, Form, InputNumber } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";

import logger from "@/logger";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";
import MultiLineFormItem from "@/components/MultiLineFormItem";

import MapSelector from "@/components/MapSelector";
import MediaSelector from "@/components/MediaSelector";
import MultiRoomTypesSelector from "@/components/MultiRoomTypesSelector";
import TimezoneSelector from "@/components/TimezoneSelector";

const SiteSettingsView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      try {
        await dispatch(startWorking());
        const settings = await api.features.getSiteConfig(siteId);
        const roomTypes = await api.sites.getSearchableRoomTypes(siteId);

        form.setFieldsValue({
          address: settings.config.address,
          lat: settings.config.lat,
          lon: settings.config.lon,
          title: settings.config.title,
          timeZone: settings.config.timeZone,
          headerMediaId: settings.headerMediaId,
          roomTypes,
        });
        setLat(settings.config.lat);
        setLon(settings.config.lon);
      } catch (e) {
        logger.error(e);
        message.error(t("audience.load-error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      await api.features.saveSiteConfig(siteId, form.getFieldsValue());
      await api.sites.updateSearchableRoomTypes(siteId, form.getFieldValue("roomTypes"));
      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleGeocode = async () => {
    try {
      const results = await geocodeByAddress(form.getFieldValue("address"));
      const latLng = await getLatLng(results[0]);
      form.setFieldsValue({
        lat: latLng.lat,
        lon: latLng.lng,
      });
      setLat(latLng.lat);
      setLon(latLng.lng);
    } catch (error) {
      logger.error(error);
      message.error(t("features-sitesettings.geocode-error"));
    }
  };

  const handleFiedsChange = (changedFields) => {
    if (changedFields[0].name[0] === "lat") {
      setLat(changedFields[0].value);
    }
    if (changedFields[0].name[0] === "lon") {
      setLon(changedFields[0].value);
    }
  };

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={20}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="large"
                style={{ width: "250px", marginBottom: "25px" }}
              />
            </Col>
            <Col span={4}>
              <Button block type="primary" onClick={handleSave}>
                {t("components.save")}
              </Button>
            </Col>
            <Col span={24}>
              <Form
                form={form}
                onFinish={handleSave}
                onFieldsChange={handleFiedsChange}
                labelCol={{
                  span: 6,
                }}
                wrapperCol={{
                  offset: 1,
                  span: 16,
                }}
                layout="horizontal"
              >
                <Row style={{ marginBottom: 20 }}>
                  <Col span={12}>
                    <MultiLineFormItem label={t("features-sitesettings.site-header")} name="headerMediaId">
                      <MediaSelector />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("features-sitesettings.site-name")} name="title">
                      <Input autoComplete="off" style={{ width: "100%" }} />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("features-places.timezone")} name="timeZone">
                      <TimezoneSelector />
                    </MultiLineFormItem>
                    <MultiLineFormItem
                      label={t("features-sitesettings.site-address")}
                      name="address"
                      style={{ marginBottom: "5px" }}
                    >
                      <Input autoComplete="off" style={{ width: "100%" }} />
                    </MultiLineFormItem>
                    <Col
                      span={12}
                      offset={8}
                      size="small"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <Button onClick={handleGeocode} variant="text">
                        {t("features-sitesettings.convert-address-to-coordinates")}
                      </Button>
                    </Col>
                    <MultiLineFormItem label={t("features-sitesettings.site-lat")} name="lat">
                      <InputNumber style={{ width: "100%" }} />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("features-sitesettings.site-lon")} name="lon">
                      <InputNumber style={{ width: "100%" }} />
                    </MultiLineFormItem>
                    <MultiLineFormItem
                      label={t("features-sitesettings.searchable-room-types")}
                      name="roomTypes"
                      tooltip={t("features-sitesettings.site-lat-lon-tooltip")}
                    >
                      <MultiRoomTypesSelector style={{ width: "100%" }} siteId={siteId} />
                    </MultiLineFormItem>
                  </Col>
                  <Col span={8}>
                    <MapSelector
                      style={{ height: "100%" }}
                      value={{
                        lat,
                        lon,
                      }}
                      onChange={(v) => {
                        form.setFieldsValue(v);
                        setLat(v.lat);
                        setLon(v.lon);
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default SiteSettingsView;
