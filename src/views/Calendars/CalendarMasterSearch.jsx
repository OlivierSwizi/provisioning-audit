import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Typography,
  Input,
  Card,
  Space,
  Button,
  Select,
  Divider,
  Checkbox,
  Modal,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useWorkDispatch } from "@/services/features/UISlice";
import { usePromptModal } from "@/components/modal/PromptModal";

import Glyph from "../../common/Glyph";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import {
  createMasterId,
  deleteMasterId,
  listMasterIds,
  setSearchTextMaster,
  updateMasterId,
} from "@/services/features/CalendarsSlice";

const { Text } = Typography;

const CalendarMasterSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const workDispatch = useWorkDispatch();
  const { colors } = useDesignTokens();
  const { appId } = useParams();
  const [askPrompt, PromptModal] = usePromptModal();

  const { masterList, searchTextMaster } = useSelector((state) => state.calendars);

  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    workDispatch(listMasterIds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRenameCategory = async () => {
    if (selectedCategories.length === 1) {
      const newName = await askPrompt(
        t("rename-category"),
        t("rename-category"),
        selectedCategories[0].label,
      );
      if (newName) {
        await workDispatch(updateMasterId(selectedCategories[0].id, { label: newName }));
      }
    }
  };

  const handleCreateCategory = async () => {
    const newName = await askPrompt(t("create-category"), t("create-category"), "");
    if (newName) {
      await workDispatch(createMasterId(newName));
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedCategories.length > 0) {
      const eventCount = selectedCategories.reduce(
        (acc, category) => acc + category.upcomingCount,
        0,
      );

      if (eventCount > 0)
        await Modal.confirm({
          title: t("confirm"),
          content:
            eventCount === 1
              ? t("delete-category-with-event-confirm")
              : t("delete-category-with-events-confirm", { count: eventCount }),
          onOk: async () => {
            await Promise.all(
              selectedCategories.map(async (category) => {
                await workDispatch(deleteMasterId(category.id));
              }),
            );
          },
        });
      else
        await Modal.confirm({
          title: t("confirm"),
          content: t("delete-category-confirm"),
          onOk: async () => {
            await Promise.all(
              selectedCategories.map(async (category) => {
                await workDispatch(deleteMasterId(category.id));
              }),
            );
          },
        });
    }
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "add-category":
        handleCreateCategory();
        break;
      case "delete-category":
        handleDeleteCategory();
        break;
      case "rename-category":
        handleRenameCategory();
        break;
      case "refresh":
        workDispatch(listMasterIds());
        break;
      default:
        break;
    }
  };

  const actionsMenu = [
    { label: t("actions"), value: "actions" },
    { label: t("add-category"), value: "add-category", disabled: selectedCategories.length > 0 },
    {
      label: masterList.length > 1 ? t("delete-categories") : t("delete-category"),
      value: "delete-category",
      disabled: selectedCategories.length === 0,
    },
    {
      label: t("rename-category"),
      value: "rename-category",
      disabled: selectedCategories.length !== 1,
    },
    {
      label: t("refresh-category"),
      value: "refresh",
    },
  ];

  return (
    <Row style={{ width: "100%" }}>
      {PromptModal}
      <Row style={{ width: "100%" }}>
        <Col span={24}>
          <Input
            size="large"
            allowClear
            onChange={(e) => dispatch(setSearchTextMaster(e.target.value))}
            prefix={<SearchOutlined />}
            placeholder={t("search-master-event")}
            value={searchTextMaster}
          />
        </Col>
      </Row>
      <Divider type="horizontal" />
      <Row style={{ width: "100%" }}>
        <Col span={4}>
          <Button
            block
            disabled={masterList.length === 0}
            onClick={() => {
              setSelectedCategories(masterList);
            }}
          >
            {t("select-all")}
          </Button>
        </Col>
        <Col span={4} offset={1}>
          <Button
            block
            disabled={masterList.length === 0}
            onClick={() => {
              setSelectedCategories([]);
            }}
          >
            {t("unselect-all")}
          </Button>
        </Col>
        <Col span={4} offset={1}>
          <Select
            options={actionsMenu}
            value={"actions"}
            style={{ width: "250px" }}
            onSelect={handleMenuAction}
          />
        </Col>
      </Row>
      <Row style={{ width: "100%" }}>
        <Col span={24}>
          <section style={{ marginTop: "16px", padding: "10px 0" }}>
            <div
              style={{
                display: "grid",
                gridGap: "10px",
                gridTemplateColumns: "repeat(auto-fill, 380px)",
              }}
            >
              {masterList
                .filter(
                  (m) =>
                    searchTextMaster.length === 0 ||
                    m.label.toUpperCase().startsWith(searchTextMaster.toUpperCase()),
                )
                .map((item, idx) => {
                  return (
                    <Card
                      key={idx}
                      onClick={() => navigate(`/apps/${appId}/calendars/master/${item.id}`)}
                      style={{ cursor: "pointer" }}
                      title={
                        <div style={{ display: "flex", flexFlow: "row" }}>
                          <Text strong>
                            <Checkbox
                              key={`chk-select-category-${idx}`}
                              checked={selectedCategories.find((su) => su.id === item.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newSelectedCategory = selectedCategories.filter(
                                  (su) => su.id !== item.id,
                                );
                                if (e.target.checked) {
                                  newSelectedCategory.push(item);
                                }

                                setSelectedCategories(newSelectedCategory);
                              }}
                              style={{
                                marginRight: "8px",
                                fontWeight: "normal",
                                color: colors.secondary_base,
                              }}
                            />
                          </Text>
                          <Text strong>{item.label}</Text>
                        </div>
                      }
                      bordered={false}
                    >
                      <Space style={{ color: colors.grey_60, width: "100%" }} />
                      <Row style={{ width: "100%" }}>
                        <Col span={24}>
                          <Typography.Text type={"secondary"}>
                            <Glyph name={"today"} style={{ marginRight: "5px" }} />
                            {item.upcomingCount > 0
                              ? t("upcoming-events", item)
                              : t("no-upcoming-events")}
                          </Typography.Text>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
            </div>
          </section>
        </Col>
      </Row>
    </Row>
  );
};

export default CalendarMasterSearch;
