import { useTranslation } from "react-i18next";
import { Row, Col, Button, message, Form, InputNumber, Select, Checkbox } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { useEmailNotifModal } from "@/components/modal/EmailNotifModal";
import logger from "@/logger";

import DayHoursPicker from "@/components/DayHoursPicker";

const keywords = [
  "{{user.firstname}}",
  "{{user.lastname}}",
  "{{resourceTitle}}",
  "{{#if day}}",
  "{{#if morning}}",
  "{{#if afternoon}}",
  "{{dateFR}}",
  "{{client}}",
  "{{dashboardUrl}}",
  "{{dateEN}}",
];

const SpaasView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [editEmailNotifModal, EmailNotifModal] = useEmailNotifModal();

  const [siteId, setSiteId] = useState(null);
  const [level, setLevel] = useState(0);

  const SPAAS_TYPES = [
    {
      key: 0,
      value: t("features-spaas.spaas-disabled"),
    },
    {
      key: 1,
      value: t("features-spaas.spaas-1"),
    },
    {
      key: 2,
      value: t("features-spaas.spaas-2"),
    },
    {
      key: 3,
      value: t("features-spaas.spaas-3"),
    },
  ];

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      try {
        await dispatch(startWorking());
        const config = await api.features.getSpaasConfig(siteId);
        form.setFieldsValue({
          type: config.type,
          hours: {
            morningHours: config.morningHours,
            afternoonHours: config.afternoonHours,
          },
          maxRecurrenceMonths: config.maxRecurrenceMonths,
          electroniqueTag: config.electroniqueTag || false,
        });

        setLevel(config.type);
      } catch (e) {
        logger.error("faield to load", e);
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
      const newValues = {
        type: form.getFieldsValue().type,
        maxRecurrenceMonths: form.getFieldsValue().maxRecurrenceMonths,
        electroniqueTag: form.getFieldsValue().electroniqueTag,
        morningHours: form.getFieldsValue().hours.morningHours,
        afternoonHours: form.getFieldsValue().hours.afternoonHours,
      };
      await api.features.saveSpaasConfig(siteId, newValues);
      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.error("Failed to save", error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleEditTemplate = async () => {
    try {
      await dispatch(startWorking());
      const template = await api.features.getSpaasTemplates();
      await dispatch(stopWorking());
      const response = await editEmailNotifModal(
        t("features-spaas.edit-confirm-presence-template"),
        template,
        keywords,
      );
      if (response) {
        await dispatch(startWorking());
        await api.features.saveSpaasTemplates(response);
        await dispatch(stopWorking());
      }
    } catch (error) {
      await dispatch(stopWorking());
      logger.error(error);
      message.error(t("audience.load-error"));
    }
  };

  const handleFiedsChange = (changedFields) => {
    if (changedFields[0].name[0] === "type") {
      setLevel(changedFields[0].value);
    }
  };

  return (
    <>
      {EmailNotifModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={15}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="large"
                style={{ width: "250px", marginBottom: "25px" }}
              />
            </Col>
            {level == 3 && (
              <Col span={4}>
                <Button block onClick={handleEditTemplate}>
                  {t("features-spaas.edit-template")}
                </Button>
              </Col>
            )}
            <Col offset={1} span={4}>
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
                  span: 3,
                }}
                wrapperCol={{
                  offset: 1,
                  span: 19,
                }}
                layout="horizontal"
              >
                <Row style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <MultiLineFormItem label={t("features-parking.spaas-type")} name="type">
                      <Select style={{ width: "100%" }}>
                        {SPAAS_TYPES.map((item) => (
                          <Select.Option key={item.key} value={item.key}>
                            {item.value}
                          </Select.Option>
                        ))}
                      </Select>
                    </MultiLineFormItem>

                    <MultiLineFormItem label={t("features-parking.timeslot")} name="hours">
                      <DayHoursPicker />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("features-spaas.spaas-recurrence-max")} name="maxRecurrenceMonths">
                      <InputNumber min={1} step={1} />
                    </MultiLineFormItem>
                    <MultiLineFormItem
                      label={t("features-spaas.use-electronique-tag")}
                      name="electroniqueTag"
                      valuePropName="checked"
                      hidden={level !== 3}
                    >
                      <Checkbox />
                    </MultiLineFormItem>
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

export default SpaasView;
