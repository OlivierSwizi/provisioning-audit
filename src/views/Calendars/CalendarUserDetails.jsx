import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Button, Divider, Card, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";

import { useWorkDispatch } from "@/services/features/UISlice";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import "./CalendarStyles.css";
import { useEventModal } from "@/components/modal/EventModal";
import {
  cancelEvent,
  loadUserEvents,
  selectUser,
  updateEvent,
} from "@/services/features/CalendarsSlice";
import dayjs from "dayjs";
import Glyph from "@/common/Glyph";
import helpers from "@/helpers";
import logger from "@/logger";

const { Text } = Typography;

const CalendarUserDetails = () => {
  const calendarRef = useRef();

  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();

  const [askUpdateEvent, EventModal] = useEventModal();
  const { colors } = useDesignTokens();

  const { selectedUser, calendarMode, selectedDay, startDay, userEvents } = useSelector(
    (state) => state.calendars,
  );

  const setCalendarDate = () => {
    if (calendarRef.current) {
      calendarRef.current.control.update({
        startDate: selectedDay,
      });
    }
    if (userId) workDispatch(selectUser(userId));
  };

  useEffect(() => {
    setCalendarDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userId) workDispatch(selectUser(userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    setCalendarDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  useEffect(() => {
    if (calendarRef.current && userEvents) {
      const lEvents = userEvents.map((event) => ({
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
  }, [userEvents]);

  const handleSelectedDay = async (args) => {
    if (args.day.value === selectedDay) return;
    await workDispatch(loadUserEvents(args.day.value));
  };

  const handleOpenEvent = async (args) => {
    const event = userEvents.find((e) => e.id === args.e.data.id);
    const updatedEvent = await askUpdateEvent(event, { knownLocation: event }, true);

    if (updatedEvent?.delete) {
      try {
        await workDispatch(cancelEvent(event.id));
        message.success(t("calendars.event-cancelled"));
      } catch (error) {
        logger.error(error);
        message.error(t("calendars.error-cancelling-event"));
      }
    } else if (updatedEvent) {
      try {
        await workDispatch(updateEvent(updatedEvent));
        message.success(t("calendars.event-updated"));
      } catch (error) {
        logger.error(error);
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

  if (!selectedUser) return null;

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
                    name="person"
                  />
                </Text>
                <Typography.Title level={3}>
                  {t("calendars.calendar-of-user", { user: helpers.formatUserName(selectedUser) })}
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
                  eventMoveHandling="Disabled"
                  eventResizeHandling="Disabled"
                  onEventClick={handleOpenEvent}
                  onBeforeEventRender={handleBeforeEventRender}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default CalendarUserDetails;
