import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Button, Divider, Card, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { API } from "@/services/features/AuthSlice";

import { useWorkDispatch } from "@/services/features/UISlice";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import "./CalendarStyles.css";
import { useEventModal } from "@/components/modal/EventModal";
import logger from "@/logger";
import {
  cancelEvent,
  createEvent,
  loadMasterEvents,
  selectMaster,
  updateEvent,
} from "@/services/features/CalendarsSlice";
import dayjs from "dayjs";
import Glyph from "@/common/Glyph";

const { Text } = Typography;

const CalendarMasterDetails = () => {
  const calendarRef = useRef();

  const { t } = useTranslation();
  const { masterId } = useParams();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();
  const api = useSelector(API);

  const [askUpdateEvent, EventModal] = useEventModal();
  const { colors } = useDesignTokens();

  const { selectedMaster, calendarMode, selectedDay, startDay, masterEvents } = useSelector(
    (state) => state.calendars,
  );

  const setCalendarDate = () => {
    if (calendarRef.current) {
      calendarRef.current.control.update({
        startDate: selectedDay,
      });
    }
    if (masterId) workDispatch(selectMaster(masterId));
  };

  useEffect(() => {
    setCalendarDate();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (masterId) workDispatch(selectMaster(masterId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId]);

  useEffect(() => {
    setCalendarDate();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  useEffect(() => {
    if (calendarRef.current && masterEvents) {
      const lEvents = masterEvents.map((event) => ({
        id: event.id,
        start: dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss"),
        end: dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss"),
        duration: dayjs(event.end).diff(dayjs(event.start), "minutes"),
        participants: event.attendees.length,
        backColor: event.color,
        event,
      }));
      calendarRef.current.control.update({ events: lEvents });
    }
  }, [masterEvents]);

  const handleSelectedDay = async (args) => {
    if (args.day.value === selectedDay) return;
    await workDispatch(loadMasterEvents(args.day.value));
  };

  const handleSlotSelected = async (args) => {
    const event = await askUpdateEvent(
      { start: args.start.value, end: args.end.value },
      { knownCategory: selectedMaster },
    );
    try {
      await workDispatch(
        createEvent(
          {
            organizer: event.organizer,
            start: dayjs(event.start).toISOString(),
            end: dayjs(event.end).toISOString(),
            title: event.title,
            description: event.description,
            attendees: event.attendees,
            masterId: event.masterId,
            subtitle: event.subtitle,
            color: event.color,
          },
          event.location,
        ),
      );
      await workDispatch(loadMasterEvents(undefined, true));
    } catch (error) {
      logger.error("Error creating event", error);
      message.error(t("calendars.error-creating-event"));
    }
  };

  const handleOpenEvent = async (args) => {
    const event = masterEvents.find((e) => e.id === args.e.data.id);
    const updatedEvent = await askUpdateEvent(event, { knownCategory: selectedMaster });

    if (updatedEvent?.delete) {
      try {
        await workDispatch(cancelEvent(event.id, event.location));
        await workDispatch(loadMasterEvents(undefined, true));

        message.success(t("calendars.event-cancelled"));
      } catch (error) {
        logger.error("Error cancelling event", error);
        message.error(t("calendars.error-cancelling-event"));
      }
    } else if (updatedEvent) {
      try {
        await workDispatch(updateEvent(updatedEvent, event.location));
        await workDispatch(loadMasterEvents(undefined, true));

        message.success(t("calendars.event-updated"));
      } catch (error) {
        logger.error("Error updating event", error);
        message.error(t("calendars.error-updating-event"));
      }
    }
  };

  const handleBeforeEventRender = (args) => {
    args.data.areas = [
      {
        top: 3,
        left: 4,
        cssClass: "event_title",
        toolTip: args.data.event.title,
        text: args.data.event.title,
      },
      /*  {
        top: 19,
        left: 4,
        cssClass: "event_organizer",
        toolTip: args.data.event.title,
        text: helpers.formatUserName(args.data.event.organizer),
      },*/
    ];

    if (args.data.duration > 30) {
      args.data.areas.push({
        bottom: 5,
        left: 4,
        cssClass: "event_place",
        toolTip: args.data.event.title,
        text: args.data.event.place.label,
      });
    }
  };

  const handleEventMovedOrResized = async (args) => {
    const eventId = args.e.data.id;
    const newStart = dayjs(args.newStart.value).toISOString();
    const newEnd = dayjs(args.newEnd.value).toISOString();
    const event = args.e.data.event;
    const roomRef = event.location;

    // chek room availability to disply an alert if necessary
    const availableRooms = await api.calendars.getAvailableRooms(newStart, newEnd, eventId);
    if (!availableRooms.find((ar) => ar.ref === roomRef)?.available) {
      message.warning(t("components.room-busy"));
    }

    try {
      await workDispatch(
        updateEvent(
          {
            ...event,
            start: newStart,
            end: newEnd,
            organizer: event.organizer.id,
            attendees: event.attendees.map((a) => a.id),
            location: event.place.placeId,
          },
          event.place.placeId,
        ),
      );
      message.success(t("calendars.event-updated"));
    } catch (error) {
      logger.error("Error updating event", error);
      message.error(t("calendars.error-updating-event"));
    }
  };

  if (!selectedMaster) return null;

  return (
    <>
      {EventModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Button size="middle" type="text" onClick={() => navigate(-1)} icon={<LeftOutlined />}>
            {t("app-details.back")}
          </Button>
        </Col>
      </Row>
      <Card bordered={false}>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Row>
              <Col
                span={18}
                style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
              >
                <Text strong style={{ marginTop: "15px" }}>
                  <Glyph
                    style={{
                      marginRight: "8px",
                      fontWeight: "normal",
                      color: colors.secondary_base,
                    }}
                    name="day"
                  />
                </Text>
                <Typography.Title level={3}>
                  {t("calendars.calendar-of-master", { master: selectedMaster })}
                </Typography.Title>
              </Col>
            </Row>
            <Row>
              <Col span={24}></Col>
            </Row>
            <Divider type="horizontal" />

            <Row>
              <Col span={24} style={{ display: "flex" }}>
                <div style={{ marginRight: "10px" }}>
                  <DayPilotNavigator
                    locale="fr-fr"
                    showMonths={3}
                    skipMonths={3}
                    startDate={startDay}
                    selectionDay={selectedDay}
                    onTimeRangeSelected={handleSelectedDay}
                  />
                </div>
                <DayPilotCalendar
                  ref={calendarRef}
                  viewType={calendarMode}
                  locale="fr-fr"
                  height="100%"
                  businessBeginsHour={8} // Set the starting hour of the business day
                  businessEndsHour={20}
                  durationBarVisible={false}
                  onEventClick={handleOpenEvent}
                  onBeforeEventRender={handleBeforeEventRender}
                  onTimeRangeSelected={handleSlotSelected}
                  onEventMoved={handleEventMovedOrResized}
                  onEventResized={handleEventMovedOrResized}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default CalendarMasterDetails;
