import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";

import { Button, Card, Col, Row, Typography } from "antd";

import { useSelectModal } from "@/components/modal/SelectModal";
import { useEffect, useState } from "react";

const AdminAppList = ({ value = [], onChange = () => {}, allAppList = [] }) => {
  const { t } = useTranslation();

  const [askSelect, SelectModal] = useSelectModal();

  const [availableApps, setAvailableApps] = useState([]);

  useEffect(() => {
    setAvailableApps(allAppList.filter((app) => !value.includes(app.id)));
  }, [allAppList, value]);

  const handleAddApp = async () => {
    const toAdd = await askSelect(
      t("select-app"),
      t("select-app-to-add"),
      availableApps
        .map((app) => ({ value: app.id, label: app.label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      (v) => v.value,
    );
    if (toAdd) {
      onChange([...value, toAdd]);
    }
  };

  const handleRemoveApp = (appId) => {
    onChange(value.filter((id) => id !== appId));
  };

  return (
    <Card
      title={
        <Row style={{ width: "100%" }}>
          <Col span={16}>
            <Typography.Text>{t("provisioning-user-apps")}</Typography.Text>
          </Col>
          <Col span={6}>
            {availableApps.length > 0 && (
              <Button size="small" onClick={handleAddApp}>
                {t("provisioning-user-add-app")}
              </Button>
            )}
          </Col>
        </Row>
      }
      bordered={false}
    >
      {
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SelectModal}
          <Row>
            <Col span={24} style={{ display: "flex", flexDirection: "column" }}>
              <Row style={{ width: "100%" }}>
                {value.map((appId) => (
                  <Col
                    span={8}
                    key={appId}
                    style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}
                  >
                    <span
                      style={{ marginRight: "15px", cursor: "pointer" }}
                      onClick={() => handleRemoveApp(appId)}
                    >
                      <DeleteOutlined style={{ color: "red" }} />
                    </span>
                    <span>{allAppList.find((app) => app.id === appId)?.label}</span>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      }
    </Card>
  );
};

export default AdminAppList;
