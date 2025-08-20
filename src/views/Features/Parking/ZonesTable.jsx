import { useEffect, useState } from "react";
import { Table, Input, Button, Popconfirm, Form, InputNumber, Tooltip, Row } from "antd";
import { useTranslation } from "react-i18next";
import GroupSelector from "@/components/GroupSelector";

const ZonesTable = ({ value = [], onChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSave = (row) => {
    const newData = [...value];
    const index = row.key;
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      onChange(
        newData.map((r) => {
          delete r.key;
          return r;
        }),
      );
    } else {
      newData.push(row);
      onChange(
        newData.map((r) => {
          delete r.key;
          return r;
        }),
      );
    }
  };

  const handleRemove = (key) => {
    const newData = value.filter((item, idx) => idx !== key);
    onChange(
      newData.map((r) => {
        delete r.key;
        return r;
      }),
    );
  };

  const handleAdd = () => {
    const newData = [...value];
    newData.push({
      key: newData.length,
      id: "",
      label: t("features-parking.swizi-parking-new-zone"),
      spaceCount: 0,
      maxReservationsPerWeek: 0,
      maxReservationsPerMonth: 0,
      noticeDelay: 0,
    });
    onChange(newData);
  };

  const columns = [
    {
      title: t("features-parking.swizi-parking-zone-id"),
      dataIndex: "id",
      editable: false,
      isNumber: false,
      width: "10%",
    },
    {
      title: t("features-parking.swizi-parking-zone-name"),
      dataIndex: "label",
      editable: true,
      isNumber: false,
      width: "20%",
    },
    {
      title: t("features-parking.swizi-parking-zone-groups"),
      dataIndex: "groups",
      editable: true,
      isNumber: false,
      width: "20%",
      isGroupSelector: true,
    },
    {
      title: t("features-parking.swizi-parking-number-of-places"),
      dataIndex: "spaceCount",
      editable: true,
      isNumber: true,
      width: "10%",
    },
    {
      title: (
        <Tooltip title={t("features-parking.swizi-parking-max-reservations-per-week-tooltip")}>
          {t("features-parking.swizi-parking-max-reservations-per-week")}
        </Tooltip>
      ),
      dataIndex: "maxReservationsPerWeek",
      editable: true,
      isNumber: true,
      width: "10%",
    },
    {
      title: (
        <Tooltip title={t("features-parking.swizi-parking-max-reservations-per-month-tooltip")}>
          {t("features-parking.swizi-parking-max-reservations-per-month")}
        </Tooltip>
      ),
      dataIndex: "maxReservationsPerMonth",
      editable: true,
      isNumber: true,
      width: "10%",
    },
    {
      title: (
        <Tooltip title={t("features-parking.swizi-parking-notice-delay-tooltip")}>
          {t("features-parking.swizi-parking-notice-delay")}
        </Tooltip>
      ),
      dataIndex: "noticeDelay",
      editable: true,
      isNumber: true,
      width: "10%",
    },
    {
      title: t("features-parking.action"),
      dataIndex: "action",
      width: "10%",
      render: (_, record) =>
        value.length >= 1 ? (
          <Popconfirm title={t("features-parking.sure-to-delete")} onConfirm={() => handleRemove(record.key)}>
            <Button type="link">{t("components.delete")}</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const EditableCell = ({
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    isNumber,
    isGroupSelector,
    ...restProps
  }) => {
    const [value, setValue] = useState();
    useEffect(() => {
      if (record) setValue(record[dataIndex]);
      // eslint-disable-next-line
    }, [record]);
    let childNode = children;

    if (editable && !isNumber && !isGroupSelector) {
      childNode = (
        <Input
          onBlur={() => handleSave({ ...record, [dataIndex]: value })}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
        />
      );
    }

    if (editable && isNumber && !isGroupSelector) {
      childNode = (
        <InputNumber
          min={0}
          onBlur={() => handleSave({ ...record, [dataIndex]: value })}
          value={value}
          onChange={(v) => setValue(v)}
          size="small"
          style={{ textAlign: "center" }}
        />
      );
    }

    if (isGroupSelector) {
      childNode = (
        <GroupSelector
          value={value}
          onChange={(v) => {
            setValue(v);
            handleSave({ ...record, [dataIndex]: v });
          }}
          style={{ width: "100%" }}
          size="small"
          mode="multiple"
        />
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        isNumber: col.isNumber,
        dataIndex: col.dataIndex,
        title: col.title,
        isGroupSelector: !!col.isGroupSelector,
        handleSave,
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Row justify="start" style={{ marginBottom: 10 }}>
        <Button onClick={handleAdd}>{t("features-parking.swizi-parking-add-zone")}</Button>
      </Row>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={value.map((v, idx) => ({ ...v, key: idx })).sort((a, b) => a.id - b.id)}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
        style={{ width: "100%" }}
      />
    </Form>
  );
};

export default ZonesTable;
