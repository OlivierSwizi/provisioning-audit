/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Col, Modal, Row, Select, Typography } from "antd";
import { useTranslation } from "react-i18next";
const { Text } = Typography;

const SelectSectorModal = ({
  siteList,
  sectorList,
  alreadyIncludedSectors,
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [siteSectorList, setSiteSectorList] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      setSelectedSite(null);
      setSelectedSector(null);
      setSiteSectorList([]);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!selectedSite) return;
    setSelectedSector(null);
    setSiteSectorList(
      (sectorList[selectedSite] || [])
        .filter(
          (sector) =>
            !alreadyIncludedSectors.find((ais) => {
              return ais.sectorId === sector.id;
            }),
        )
        .sort((a, b) => a.label.localeCompare(b.label)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorList, selectedSite]);

  const handleOk = () => {
    setIsVisible(false);
    promiseResolve({ siteId: selectedSite, sectorId: selectedSector });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      style={{ height: "500px" }}
      okText={t("add")}
      okButtonProps={{ disabled: !selectedSector }}
    >
      <Row>
        <Typography.Title level={4}>{t("add-sector")}</Typography.Title>
      </Row>
      <Row style={{ width: "100%" }} align="middle">
        <Col span={6}>
          <Text>{t("site")}</Text>
        </Col>
        <Col span={18}>
          <Select value={selectedSite} onChange={(key) => setSelectedSite(key)}>
            {siteList.map((site) => (
              <Select.Option key={site.id} value={site.id}>
                {site.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row style={{ width: "100%", marginTop: "15px" }} align="middle">
        <Col span={6}>
          <Text>{t("sector")}</Text>
        </Col>
        <Col span={18}>
          <Select
            value={selectedSector}
            onChange={(key) => setSelectedSector(key)}
            disabled={!selectedSite}
            showSearch
            filterOption={(input, option) =>
              option?.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {siteSectorList.map((sector) => (
              <Select.Option key={sector.id} value={sector.id}>
                {sector.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectSectorModal;

export const useSelectSectorModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [siteList, setSiteList] = useState([]);
  const [sectorList, setSectorList] = useState({});
  const [alreadyIncludedSectors, setAlreadyIncludedSectors] = useState([]);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const selectSector = (siteList, sectorList, alreadyIncludedSectors) => {
    setIsVisible(true);
    setSiteList(siteList);
    setSectorList(sectorList);
    setAlreadyIncludedSectors(alreadyIncludedSectors);

    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    selectSector,

    <SelectSectorModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      siteList={siteList}
      sectorList={sectorList}
      alreadyIncludedSectors={alreadyIncludedSectors}
    />,
  ];
};
