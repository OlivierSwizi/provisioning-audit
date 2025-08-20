/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Input, Form, Col, Row, Select, Button, Popconfirm, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { API } from "@/services/features/AuthSlice";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ColorSelector from "../ColorSelector";

import UserSearch from "../UserSearch";
import RichEditor from "../RichEditor";

import UserListSearch from "../UserListSearch";
import RangePicker from "../RangePicker";

const LABEL_MAX_WIDTH = "150px";

const EventModal = ({
  event,
  knownLocation,
  knownCategory,
  readOnly,
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [, setIsCreationForm] = useState(false);
  const [masterIds, setMasterIds] = useState([]);
  const [filteredMasterIds, setFilteredMasterIds] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [availableRoomList, setAvailableRoomList] = useState([]);
  const [isCurrentRoomBusy, setIsCurrentRoomBusy] = useState([]);
  const [roomFilter, setRoomFilter] = useState("");
  const api = useSelector(API);

  const loadMasters = async () => {
    const masterIds = await api.calendars.listMasterId();
    setMasterIds(masterIds.map((m) => m.label));
    setFilteredMasterIds([]);
  };

  const checkAvailability = async () => {
    const { period, location } = form.getFieldsValue();
    if (period?.start && period?.end) {
      const availableRooms = await api.calendars.getAvailableRooms(
        period.start ? period.start.toISOString() : dayjs().toISOString(),
        period.end ? period.end.toISOString() : dayjs().add(1, "day").toISOString(),
        event?.id,
      );
      setAvailableRoomList(availableRooms);
      if (!roomFilter) setFilteredRooms(availableRooms);
      setIsCurrentRoomBusy(
        location &&
          !availableRooms.find((ar) => ar.ref === location || ar.ref === location.placeId)
            ?.available,
      );
    }
  };

  useEffect(() => {
    if (event && event.id) {
      form.setFieldsValue({
        id: event.id,
        period: {
          start: dayjs(event.start),
          end: dayjs(event.end),
        },
        organizer: event.organizer,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        attendees: event.attendees,
        color: event.color || "#0693E3",
        masterId: event.masterId || "",
        location: event.place.placeId,
      });
      setIsCreationForm(false);
    } else if (event) {
      form.setFieldsValue({
        id: undefined,
        period: {
          start: dayjs(event.start),
          end: dayjs(event.end),
        },
        color: "#0693E3",
        organizer: undefined,
        subtitle: "",
        title: "",
        description: "",
        attendees: [],
        masterId: knownCategory || "",
        location: knownLocation?.ref || "",
      });
      setIsCreationForm(true);
    }
    checkAvailability();

    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const handleOk = async () => {
    setIsVisible(false);
    const newValues = form.getFieldsValue();
    promiseResolve({
      id: event?.id,
      start: newValues.period.start.toISOString(),
      end: newValues.period.end.toISOString(),
      title: newValues.title,
      subtitle: newValues.subtitle,
      organizer: newValues.organizer?.id,
      description: newValues.description,
      attendees: newValues.attendees.map((a) => a.id),
      color: newValues.color,
      masterId: newValues.masterId,
      location: newValues.location,
    });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleDelete = () => {
    setIsVisible(false);
    promiseResolve({ delete: true });
  };

  const handleValueChange = (changedValues) => {
    if (changedValues.period || changedValues.location) checkAvailability();
  };

  const handleFilterRoom = (search) => {
    setRoomFilter(search);
    const filter = availableRoomList.filter((ar) =>
      ar.label.toUpperCase().startsWith(search.toUpperCase()),
    );

    setFilteredRooms(filter);
  };

  return (
    <Modal
      open={isVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={800}
      bodyStyle={{ height: "500px", overflow: "auto" }}
      footer={[
        <Button key="back" onClick={handleCancel} style={{ width: "180px" }}>
          {t("components.close")}
        </Button>,
        event?.id && !readOnly ? (
          <Popconfirm onConfirm={handleDelete} title={t("components.confirm-delete-event")}>
            <Button style={{ width: "180px" }}>{t("components.delete")}</Button>
          </Popconfirm>
        ) : null,
        !readOnly ? (
          <Button
            type="primary"
            key="save"
            onClick={() => form.submit()}
            style={{ width: "180px" }}
          >
            {t("components.save")}
          </Button>
        ) : null,
      ]}
    >
      <Form
        form={form}
        layout="horizontal"
        colon={false}
        onFinish={handleOk}
        onValuesChange={handleValueChange}
      >
        <Row style={{ width: "100%", position: "relative" }}>
          <Col span={19}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.slot")}</div>}
              name={"period"}
              style={{ marginBottom: "0" }}
            >
              <RangePicker />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-color")}</div>}
              name={"color"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <ColorSelector disabled={readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={18}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-title")}</div>}
              name={"title"}
              style={{ marginBottom: "0", width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t("components.required-field"),
                },
              ]}
            >
              <Input
                size="small"
                style={{ width: "100%" }}
                disabled={readOnly}
                autoComplete="off"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-subtitle")}</div>}
              name={"subtitle"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <Input
                size="small"
                style={{ width: "100%" }}
                disabled={readOnly}
                autoComplete="off"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-location")}</div>}
              name={"location"}
              style={{ marginBottom: "0", width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t("components.required-field"),
                },
              ]}
            >
              <Select
                disabled={readOnly || !!knownLocation}
                showSearch
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                size="middle"
                onSearch={handleFilterRoom}
              >
                {(filteredRooms || []).map((room) => {
                  return (
                    <Select.Option key={room.ref} value={room.ref}>
                      <span style={{ color: room.available ? "black" : "gray" }}>{room.label}</span>
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          {isCurrentRoomBusy && (
            <Row style={{ width: "100%" }}>
              <Col span={24} style={{ textAlign: "center" }}>
                <Typography.Text type="warning" strong>
                  {t("components.room-busy")}
                </Typography.Text>
              </Col>
            </Row>
          )}
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-master-id")}</div>}
              name={"masterId"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <Select
                disabled={readOnly || !!knownCategory}
                showSearch
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                size="middle"
                onSearch={(search) => {
                  const filter = masterIds.filter((masterId) =>
                    masterId.toUpperCase().startsWith(search.toUpperCase()),
                  );

                  if (!filter.includes(search)) filter.unshift(search);
                  setFilteredMasterIds(filter);
                }}
                options={filteredMasterIds.map((id) => ({ key: id, label: id, value: id }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-organizer")}</div>}
              name={"organizer"}
              style={{ marginBottom: "0", width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t("components.required-field"),
                },
              ]}
            >
              <UserSearch size="middle" disabled={readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%", height: "200px" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-description")}</div>}
              name={"description"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <RichEditor style={{ width: "100%", height: "150px" }} disabled={readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("components.event-attendees")}</div>}
              name={"attendees"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <UserListSearch disabled={readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EventModal;

export const useEventModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [event, setEvent] = useState();
  const [knownLocation, setKnownLocation] = useState();
  const [knownCategory, setKnownCategory] = useState();
  const [readOnly, setReadOnly] = useState(false);

  const updateEvent = (initialEvent, known = {}, readOnly = false) => {
    const { knownCategory, knownLocation } = known;
    setIsVisible(true);
    setEvent(initialEvent);
    setKnownLocation(knownLocation);
    setKnownCategory(knownCategory);
    setReadOnly(readOnly);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    updateEvent,

    <EventModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      event={event}
      knownLocation={knownLocation}
      knownCategory={knownCategory}
      readOnly={readOnly}
    />,
  ];
};
