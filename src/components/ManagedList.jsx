import { usePromptModal } from "@/components/modal/PromptModal";
import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Button, Card, List, Radio } from "antd";
import { useEffect } from "react";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ManagedList = ({
  selected,
  items,
  onAdd,
  onRemove,
  onSelect,
  onEdit,
  cell,
  addTitleKey = "add",
  chooseNameKey = "choose-name",
  title,
}) => {
  const { t } = useTranslation();
  const [askUserInput, PromptModal] = usePromptModal();

  const handleAdd = async () => {
    let newName = await askUserInput(t(chooseNameKey));
    onAdd(newName);
  };

  const handleRemove = (item) => {
    onRemove(item);
  };

  useEffect(() => {
    if (!items || !items.length) return;
    if (
      onSelect &&
      (!selected ||
        items.findIndex((item) => JSON.stringify(item) === JSON.stringify(selected)) === -1)
    ) {
      onSelect(items[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <>
      {PromptModal}
      <Card
        style={{ width: "100%" }}
        title={title && <Text strong>{title}</Text>}
        extra={title ? <Button onClick={handleAdd}>{t(addTitleKey)}</Button> : null}
        bordered={false}
      >
        <Row style={{ width: "100%" }}>
          {!title && (
            <Col span={24} style={{ alignContent: "center" }}>
              <Button onClick={handleAdd}>{t(addTitleKey)}</Button>
            </Col>
          )}
          <Col span={24} style={{ maxHeight: "700px", overflow: "auto" }}>
            <List
              locale={{ emptyText: <Text>{t("empty-list")}</Text> }}
              style={{ minHeight: "350px" }}
            >
              {items.map((item, idx) => (
                <List.Item
                  key={idx}
                  actions={[
                    onEdit ? (
                      <Button
                        style={{ width: "12px", height: "12px" }}
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          onEdit(item);
                        }}
                      />
                    ) : null,
                    <Button
                    key={`button${idx}`}
                      style={{ width: "12px", height: "12px" }}
                      type="link"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        handleRemove(item);
                      }}
                    />,
                  ]}
                >
                  <Row style={{ width: "100%" }}>
                    {onSelect && (
                      <Col span={3}>
                        <Radio checked={selected?.id === item.id} onChange={() => onSelect(item)} />
                      </Col>
                    )}
                    <Col span={21}>{cell(item) || <Text>{item.value}</Text>}</Col>
                  </Row>
                </List.Item>
              ))}
            </List>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ManagedList;
