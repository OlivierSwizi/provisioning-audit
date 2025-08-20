import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";

import { Button, Card, Col, Row, Typography } from "antd";

import { useSelectModal } from "@/components/modal/SelectModal";
import { useEffect, useState } from "react";

const AdminSiteList = ({
  value = [],
  onChange = () => {},
  allSiteList = [],
  selectedApps = [],
}) => {
  const { t } = useTranslation();

  const [askSelect, SelectModal] = useSelectModal();

  const [availableSites, setAvailableSites] = useState([]);

  useEffect(() => {
    setAvailableSites(
      allSiteList.filter((site) => {
        return !value.includes(site.value) && selectedApps.includes(site.appId);
      }),
    );
  }, [allSiteList, selectedApps, value]);

  const handleAddSite = async () => {
    const toAdd = await askSelect(
      t("admin.select-site"),
      t("admin.select-site-to-add"),
      availableSites.map((site) => ({ value: site.value, label: site.label })),
    );
    if (toAdd) {
      const site = allSiteList.find((s) => s.value === toAdd);
      onChange([...value, { siteId: site.value, appId: site.appId }]);
    }
  };

  const handleRemoveSite = (siteId) => {
    onChange(value.filter((site) => site.siteId !== siteId));
  };

  return (
    <Card
      title={
        <Row style={{ width: "100%" }}>
          <Col span={16}>
            <Typography.Text>{t("admin.provisioning-user-sites")}</Typography.Text>
          </Col>
          <Col span={6}>
            {availableSites.length > 0 && (
              <Button size="small" onClick={handleAddSite}>
                {t("admin.provisioning-user-add-site")}
              </Button>
            )}
          </Col>
        </Row>
      }
      bordered={false}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {SelectModal}
        <Row>
          <Col span={24} style={{ display: "flex", flexDirection: "column" }}>
            <Row style={{ width: "100%" }}>
              {value.map((site) => {
                return (
                  <Col
                    span={8}
                    key={site.siteId}
                    style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}
                  >
                    <span
                      style={{ marginRight: "15px", cursor: "pointer" }}
                      onClick={() => handleRemoveSite(site.siteId)}
                    >
                      <DeleteOutlined style={{ color: "red" }} />
                    </span>
                    <span>{allSiteList.find((s) => site.siteId === s.value)?.label}</span>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default AdminSiteList;
