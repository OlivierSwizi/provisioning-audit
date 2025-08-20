import Glyph from "@/common/Glyph";
import { Button, Card, Col, Popconfirm, Row, Space, Tooltip, Typography } from "antd";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import useDesignTokens from "@/hook/useDesignTokens";

import { useSelectSectorModal } from "@/components/modal/SelectSectorModal";

const Sectors = ({ group, onAddSector, onRemoveSector }) => {
  const { t } = useTranslation();

  const [groupSectors, setGroupSectors] = useState([]);

  const sectorList = useSelector((state) => state.apps.sectorList);
  const siteList = useSelector((state) => state.apps.siteList);

  const [selectSector, SelectSectorModal] = useSelectSectorModal();

  const { colors } = useDesignTokens();

  const handleAddSector = async () => {
    const sector = await selectSector(siteList, sectorList, group.sectors);
    if (sector) {
      onAddSector(sector);
    }
  };

  useEffect(() => {
    if (!group) return;
    let groupSectors = [];
    siteList.forEach((site) => {
      (sectorList[site.id] || []).forEach((sector) => {
        if (group.sectors.find((s) => s.sectorId === sector.id)) {
          groupSectors.push({
            siteId: site.id,
            siteLabel: site.label,
            sectorId: sector.id,
            sectorLabel: sector.label,
          });
        }
      });
    });
    groupSectors = groupSectors.sort((a, b) =>
      (a.siteLabel + a.sectorLabel).localeCompare(b.siteLabel + b.sectorLabel),
    );
    setGroupSectors(groupSectors);
  }, [sectorList, siteList, group]);

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
      {SelectSectorModal}
      <Row gutter={[10, 10]}>
        <Col span={22}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("sectors-of-group")}
          </Typography.Title>
        </Col>

        <Col span={2}>
          <Button
            type="primary"
            style={{ float: "right", marginLeft: "auto" }}
            size="small"
            onClick={handleAddSector}
          >
            <Space size="small">
              <Glyph name={"add-person"} style={{ fontSize: "18px" }} />
              {t("add-sector")}
            </Space>
          </Button>
        </Col>
      </Row>
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {groupSectors.length === 0 ? (
          <Typography.Text style={{ textAlign: "center" }}>
            {t("no-sector-in-group")}
          </Typography.Text>
        ) : (
          <>
            {groupSectors.map((gs) => {
              return (
                <Row key={gs.sectorId}>
                  {}
                  <Col span={2}>
                    <Button disabled size="middle" shape="circle" type="dashed"></Button>
                  </Col>
                  <Col span={8}>{gs.siteLabel}</Col>

                  <Col span={8}>{gs.sectorLabel}</Col>
                  <Col span={2}>
                    <Tooltip title={t("remove-sector-from-group")}>
                      <Popconfirm
                        title={t("remove-sector-from-group-confirmation")}
                        onConfirm={() => onRemoveSector(gs.siteId, gs.sectorId)}
                        placement="left"
                        okText={t("yes")}
                        cancelText={t("no")}
                      >
                        <Glyph
                          name="delete"
                          style={{
                            fontSize: "18px",
                            color: colors.highlight_light,
                            cursor: "pointer",
                          }}
                        />
                      </Popconfirm>
                    </Tooltip>
                  </Col>
                </Row>
              );
            })}
          </>
        )}
      </div>
    </Card>
  );
};

export default Sectors;
