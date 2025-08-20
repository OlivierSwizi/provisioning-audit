import { useTranslation } from "react-i18next";
import { Row, Col, Button, message, Form, InputNumber, Select, Tabs } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";
import MultiLineFormItem from "@/components/MultiLineFormItem";

import DayHoursPicker from "@/components/DayHoursPicker";
import DaysOfWeekPeeker from "@/components/DaysOfWeekPeeker";
import ZonesTable from "./ZonesTable";
import logger from "@/logger";
import TemplateNotifEditor from "@/components/template-editors/MultilangNotificationEditor";
import { i18nArrayToObject, i18nObjectToArray } from "@/helpers";

const keywords = ["reservationDate"];

const SpaasView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);
  const [type, setType] = useState(0);

  const PARKING_TYPES = [
    {
      key: "NONE",
      value: t("features-parking.parking-none"),
    },
    {
      key: "IZIX",
      value: t("features-parking.parking-izix"),
    },
    {
      key: "SWIZI",
      value: t("features-parking.parking-swizi"),
    },
  ];

  const loadSwiziConfig = async (config) => {
    try {
      await dispatch(startWorking());
      const zones = await api.swiziParking.listSectors(siteId);

      form.setFieldsValue({
        provider: config.providerType || "NONE",
        hours: {
          morningHours: config.morningHours,
          afternoonHours: config.afternoonHours,
        },
        days: config.days,
        beforePushDelay: config.push.sendBefore,
        zones,
        pushTemplate: i18nObjectToArray(config.push.template),
      });
    } catch (error) {
      logger.error(error);
    } finally {
      await dispatch(stopWorking());
    }
  };

  const loadConfig = async () => {
    let config;
    try {
      await dispatch(startWorking());
      config = await api.features.getParkingConfig(siteId);
    } catch (e) {
      logger.error(e);
      message.error(t("audience.load-error"));
    } finally {
      await dispatch(stopWorking());
    }

    const type = (config?.providerType || "NONE").toUpperCase();
    setType(type);

    if (type === "SWIZI") return loadSwiziConfig(config);

    form.setFieldsValue({
      provider: config?.providerType || "NONE",
      hours: {
        morningHours: config?.morningHours,
        afternoonHours: config?.afternoonHours,
      },
      days: config?.days,
      beforePushDelay: config?.push?.sendBefore,
      organizationId: config?.organizationId,
    });
  };

  useEffect(() => {
    if (!appId || !siteId) return;

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleSaveSwiziConfig = async () => {
    let sectors = form.getFieldValue("zones");

    sectors.forEach((sector) => {
      // remove id field if empty
      if (!sector.id) delete sector.id;
      sector.maxReservationsPerMonth = sector.maxReservationsPerMonth || 0;
      sector.maxReservationsPerWeek = sector.maxReservationsPerWeek || 0;
      sector.noticeDelay = sector.noticeDelay || 0;
      sector.spacCount = sector.spacCount || 0;
      sector.vehicleTypes = sector.vehicleTypes || [];
    });
    await api.swiziParking.updateSectors(siteId, sectors);
  };

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      const newValues = {
        days: form.getFieldValue("days"),
        push: {
          sendBefore: form.getFieldValue("beforePushDelay"),
          template: i18nArrayToObject(form.getFieldValue("pushTemplate")),
        },
        morningHours: form.getFieldValue("hours").morningHours,
        providerType: form.getFieldValue("provider").toUpperCase(),
        afternoonHours: form.getFieldValue("hours").afternoonHours,
        organizationId: form.getFieldValue("organizationId"),
      };

      await api.features.saveParkingConfig(siteId, newValues);
      if (type === "SWIZI") await handleSaveSwiziConfig();
      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.log(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }

    loadConfig();
  };

  const handleFiedsChange = (changedFields) => {
    if (changedFields[0].name[0] === "provider") {
      setType(changedFields[0].value);
    }
  };

  const swiziTabs = [
    {
      label: t("features-parking.swizi-parking-zones"),
      key: "zones",
      children: (
        <Form.Item name="zones" label={null} labelCol={null} wrapperCol={{ span: 24 }}>
          <ZonesTable />
        </Form.Item>
      ),
    },
    {
      label: t("features-parking.swizi-parking-notificaions-tempplate"),
      key: "notifications",
      children: (
        <Form.Item name="pushTemplate" label={null} labelCol={null} wrapperCol={{ span: 24 }}>
          <TemplateNotifEditor keywords={keywords} />
        </Form.Item>
      ),
    },
  ];

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
                  span: 5,
                }}
                wrapperCol={{
                  offset: 1,
                  span: 17,
                }}
                layout="horizontal"
              >
                <Row style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <MultiLineFormItem label={t("features-parking.spaas-type")} name="provider">
                      <Select style={{ width: "100%", maxWidth: "350px" }}>
                        {PARKING_TYPES.map((item) => (
                          <Select.Option key={item.key} value={item.key}>
                            {item.value}
                          </Select.Option>
                        ))}
                      </Select>
                    </MultiLineFormItem>
                    <MultiLineFormItem
                      label={t("features-parking.parking-days")}
                      name="days"
                      hidden={type === "NONE"}
                    >
                      <DaysOfWeekPeeker />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("features-parking.timeslot")} name="hours" hidden={type === "NONE"}>
                      <DayHoursPicker />
                    </MultiLineFormItem>

                    <MultiLineFormItem
                      label={t("features-parking.parking-push-before")}
                      name="beforePushDelay"
                      hidden={type === "NONE"}
                    >
                      <InputNumber
                        formatter={(value) => `${value} min`}
                        parser={(value) => value.replace(" min", "")}
                        style={{ width: "100px" }}
                      />
                    </MultiLineFormItem>
                    <MultiLineFormItem
                      label={t("features-parking.parking-organization-id")}
                      name="organizationId"
                      hidden={type === "NONE"}
                    >
                      <InputNumber style={{ width: "100px" }} />
                    </MultiLineFormItem>
                  </Col>
                </Row>
                {type === "SWIZI" && (
                  <Row style={{ marginBottom: 20 }}>
                    <Tabs items={swiziTabs} style={{ width: "100%" }} />
                  </Row>
                )}
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default SpaasView;
