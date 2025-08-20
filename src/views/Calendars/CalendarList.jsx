import { useTranslation } from "react-i18next";
import CalendarRoomSearch from "./CalendarRoomSearch";
import { Row, Col, Typography, Tabs } from "antd";

import CalendarUserSearch from "./CalendarUserSearch";
import CalendarMasterSearch from "./CalendarMasterSearch";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTab } from "@/services/features/CalendarsSlice";

const CalendarList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { selectedTab } = useSelector((state) => state.calendars);

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ marginBottom: "15px" }}>
            <Col span={18}>
              <Typography.Title level={3}>{t("calendars.calendars")}</Typography.Title>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Tabs
              activeKey={selectedTab}
              onChange={(key) => {
                dispatch(setSelectedTab(key));
              }}
              style={{ width: "100%" }}
              items={[
                {
                  key: "tab-room",
                  label: t("calendars.event-calendar-room"),
                  children: <CalendarRoomSearch />,
                },
                {
                  key: "tab-user",
                  label: t("calendars.event-calendar-user"),
                  children: <CalendarUserSearch />,
                },
                {
                  key: "tab-master",
                  label: t("calendars.event-calendar-master"),
                  children: <CalendarMasterSearch />,
                },
              ]}
            />
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default CalendarList;
