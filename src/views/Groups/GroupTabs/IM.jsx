import Glyph from "@/common/Glyph";
import useDesignTokens from "@/hook/useDesignTokens";
import { Button, Card, Row, Space, Table, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

const IM = ({ group, messageList, onActiveIM, onPublishMessage, onUpdateMessage }) => {
  const { t } = useTranslation();
  const { colors } = useDesignTokens();

  const { isChatChannel } = group;

  const handleCreateAnnouncement = async (type) => {
    onPublishMessage(type);
  };

  const handleUpdateAnnouncement = async (record, type) => {
    onUpdateMessage(record.id, type);
  };

  const columns = [
    {
      title: t("groups.type"),
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <Tag color={text === "ANNOUNCEMENT" ? "blue" : "green"}>
          {text === "ANNOUNCEMENT" ? t("groups.announcement") : t("groups.message")}
        </Tag>
      ),
    },
    {
      title: t("groups.created-at"),
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: t("groups.updated-at"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (text ? text : "-"),
    },
    {
      title: t("groups.announcement"),
      dataIndex: "message",
      key: "message",
    },
    {
      title: "",
      dataIndex: "update",
      key: "update",
      render: (text, record) => (
        <Glyph
          name="edit"
          onClick={() => handleUpdateAnnouncement(record, record.type)}
          style={{
            fontSize: "18px",
            color: colors.highlight_light,
            cursor: "pointer",
          }}
        />
      ),
    },
  ];

  return (
    <Card
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      bordered={false}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <Typography.Title level={4} style={{ margin: 0, flexGrow: 1 }}>
          {t("groups.instant-messaging")}
        </Typography.Title>

        {isChatChannel && (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => handleCreateAnnouncement("ANNOUNCEMENT")}
            >
              <Space size="small">
                <Glyph name={"message"} style={{ fontSize: "18px" }} />
                {t("groups.publish-im-announce")}
              </Space>
            </Button>
            <Button type="primary" size="small" onClick={() => handleCreateAnnouncement("ADMIN")}>
              <Space size="small">
                <Glyph name={"message"} style={{ fontSize: "18px" }} />
                {t("groups.publish-im-message")}
              </Space>
            </Button>
          </Space>
        )}
      </div>
      {isChatChannel ? (
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {messageList.length === 0 ? (
            <Typography.Title level={5} style={{ textAlign: "center" }}>
              {t("groups.no-announcements-yet")}
            </Typography.Title>
          ) : (
            <Table columns={columns} dataSource={messageList} />
          )}
        </div>
      ) : (
        <Row justify="center">
          <Button type="primary" onClick={onActiveIM}>
            {t("groups.create-im-channel")}
          </Button>
        </Row>
      )}
    </Card>
  );
};

export default IM;
