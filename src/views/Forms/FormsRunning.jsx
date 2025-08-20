import Glyph from "@/common/Glyph";
import TranslatedLabel from "@/components/TranslatedLabel";
import I18nInput from "@/components/UI/Inputs/I18nInputs/I18nInput";
import logger from "@/logger";
import { API } from "@/services/features/AuthSlice";
import {
  createForm,
  deleteForms,
  groupedForms,
  listForms,
  updateForm,
} from "@/services/features/FormSlice";
import { useWorkDispatch } from "@/services/features/UISlice";
import { EditOutlined, ExportOutlined, WarningOutlined } from "@ant-design/icons";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { pick } from "ramda";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDebounce } from "use-debounce";

const LOCALES = [
  {
    icon: "🇫🇷",
    label: "FR",
    value: "fr",
  },
  {
    icon: "🇺🇸",
    label: "EN",
    value: "en",
  },
];

const FormsRunning = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const workDispatch = useWorkDispatch();
  const { message, modal } = App.useApp();

  const api = useSelector(API);
  const [forms] = useSelector(groupedForms);

  const [locale, setlocale] = useState(LOCALES[0].value);
  const [selectedFormKeys, setSelectedFormKeys] = useState([]);
  const [selectedForm, setSelectedForm] = useState();
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);
  const [searchGroup, setSearchGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [nbUsers, setNbUsers] = useState({});
  const [nbUsersAll, setNbUsersAll] = useState(null);

  const [debouncedSearchGroup] = useDebounce(searchGroup, 500);

  const formGroups = Form.useWatch(["groups"], form);
  useEffect(() => {
    setNbUsersAll(<Spin size="small" />);
    const groups = (formGroups || []).map((group) => {
      return typeof group === "number" ? { id: group } : { id: group.value };
    });
    if (!groups.length) {
      setNbUsersAll(null);
      return;
    }
    api.form
      .countUsers({ groups })
      .then(({ count }) => {
        setNbUsersAll(count);
      })
      .catch(() => {
        setNbUsersAll("-");
      });
  }, [api.form, formGroups]);

  useEffect(() => {
    setIsFetchingGroups(true);
    api.groups
      .searchGroups({ filter: debouncedSearchGroup, page: 1, pageSize: 10 })
      .then((groups) => {
        setGroups(groups.items);
      })
      .finally(() => {
        setIsFetchingGroups(false);
      });
  }, [api.groups, debouncedSearchGroup]);

  useEffect(() => {
    setNbUsers((prev) => ({
      ...prev,
      ...(selectedForm?.groups || []).reduce((c, i) => ({ ...c, [i.id]: i.nbUsers }), {}),
      ...groups.reduce((c, i) => ({ ...c, [i.id]: i.nbUsers }), {}),
    }));
  }, [groups, selectedForm?.groups]);

  useEffect(() => {
    logger.log("selectedForm", selectedForm);
    form.setFieldsValue({ name: null }); // Empty the field before setting the value
    form.setFieldsValue({
      name: selectedForm?.name || {},
      startDate: selectedForm?.startDate ? dayjs(selectedForm.startDate) : undefined,
      endDate: selectedForm?.endDate ? dayjs(selectedForm.endDate) : undefined,
      link: selectedForm?.link || "",
      groups: (selectedForm?.groups || []).map((group) => ({
        label: group.label,
        value: group.id,
      })),
    });
  }, [form, selectedForm]);

  const handleDeleteForms = () => {
    modal.confirm({
      icon: <WarningOutlined style={{ color: "var(--highlight_light)" }} />,
      title: t("forms.delete.title", { count: selectedFormKeys.length }),
      content: t("forms.delete.description"),
      onOk: () => {
        workDispatch(deleteForms(selectedFormKeys))
          .then(unwrapResult)
          .then(() => {
            setSelectedFormKeys([]);
            workDispatch(listForms());
          })
          .catch(() => {
            message.error(t("forms.delete.error"));
          });
      },
    });
  };

  const handleSaveForm = (values) => {
    const groups = (values.groups || []).map((group) => {
      return typeof group === "number" ? { id: group } : { id: group.value };
    });
    const data = {
      ...values,
      id: selectedForm.id,
      name: pick(
        LOCALES.map((i) => i.value),
        values.name,
      ),
      groups,
    };
    const action = data.id ? updateForm(data) : createForm(data);

    return workDispatch(action)
      .then(unwrapResult)
      .then(() => {
        setSelectedForm(null);
        workDispatch(listForms());
      })
      .catch(() => {
        if (selectedForm.id) message.error(t("forms.new.error"));
        else message.error(t("forms.edit.error"));
      });
  };

  const applyPreset = (nbDay) => {
    form.setFieldsValue({
      startDate: dayjs().startOf("hour"),
      endDate: dayjs().startOf("hour").add(nbDay, "day"),
    });
  };

  const tableDatasource = useMemo(() => {
    return forms;
  }, [forms]);

  const tableColumns = useMemo(() => {
    return [
      {
        title: "#",
        dataIndex: "id",
        render: (id) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }} code copyable>
            {id}
          </Typography.Text>
        ),
      },
      {
        title: t("forms.col.name"),
        dataIndex: "name",
        render: (name) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            <TranslatedLabel label={name} />
          </Typography.Text>
        ),
      },
      {
        title: t("forms.col.startDate"),
        dataIndex: "startDate",
        render: (startDate) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            {startDate ? dayjs(startDate).format("llll") : "-"}
          </Typography.Text>
        ),
      },
      {
        title: t("forms.col.endDate"),
        dataIndex: "endDate",
        render: (endDate) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            {endDate ? dayjs(endDate).format("llll") : "-"}
          </Typography.Text>
        ),
      },
      {
        title: t("forms.col.visibility"),
        dataIndex: "nbUsers",
        render: (nbUsers) => {
          return (
            <Space>
              <Typography.Text type="secondary">
                <Glyph name={"person"} />
              </Typography.Text>
              <Typography.Text style={{ whiteSpace: "nowrap" }} type="secondary">
                {typeof nbUsers === "number" ? nbUsers : t("forms.col.visibility.all")}
              </Typography.Text>
            </Space>
          );
        },
      },
      {
        key: "actions",
        align: "right",
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} type="link" onClick={() => setSelectedForm(record)}>
              {t("forms.edit")}
            </Button>
            <Button icon={<ExportOutlined />} type="link" href={record.link} target="_blank">
              {t("forms.open")}
            </Button>
          </Space>
        ),
      },
    ];
  }, [t]);

  const groupOptions = useMemo(() => {
    return groups.map((group) => ({
      label: group.label,
      value: group.id,
    }));
  }, [groups]);

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col flex={"auto"} />
        <Col>
          <Space>
            <Button
              disabled={!selectedFormKeys.length}
              danger
              type="default"
              onClick={handleDeleteForms}
            >
              {t("forms.delete")}
            </Button>
            <Button type="primary" onClick={() => setSelectedForm({})}>
              {t("forms.new")}
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ overflow: "hidden" }}
            styles={{ body: { padding: 0, overflowX: "auto" } }}
          >
            <Table
              style={{ width: "100%" }}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedFormKeys,
                onChange: setSelectedFormKeys,
              }}
              dataSource={tableDatasource}
              columns={tableColumns}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        forceRender // https://ant.design/components/form#why-is-there-a-form-warning-when-used-in-modal
        open={!!selectedForm}
        title={t("forms.edit.title")}
        okText={t("forms.save")}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => setSelectedForm(false)}
      >
        <Divider />
        <Flex justify="flex-end">
          <Segmented
            defaultValue={locale}
            value={locale}
            onChange={setlocale}
            options={LOCALES.map((locale) => ({
              icon: locale.icon,
              label: <Typography.Text strong>{locale.label}</Typography.Text>,
              value: locale.value,
            }))}
          />
        </Flex>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSaveForm}
          onValuesChange={(changed) => {
            if (changed.startDate) {
              form.setFieldsValue({ endDate: undefined });
            }
          }}
        >
          <Form.Item
            label={t("forms.field.name")}
            name={["name"]}
            rules={[
              { required: true, transform: (val) => Object.values(val || {}).filter(Boolean)[0] },
            ]}
          >
            <I18nInput locale={locale} />
          </Form.Item>

          <Row gutter={[20, 0]}>
            <Col span={12}>
              <Form.Item
                label={t("forms.field.startDate")}
                name={["startDate"]}
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                  showTime={{
                    showSecond: false,
                    minuteStep: 15,
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("forms.field.endDate")}
                name={["endDate"]}
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current < dayjs(form.getFieldValue("startDate"))
                  }
                  showTime={{
                    showSecond: false,
                    minuteStep: 15,
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Space style={{ marginBottom: "1rem" }}>
                <Typography.Text type={"secondary"}>{t("forms.field.preset")} :</Typography.Text>
                <Button size="small" onClick={() => applyPreset(5)}>
                  {t("forms.field.preset.week", { count: 1 })}
                </Button>
                <Button size="small" onClick={() => applyPreset(30)}>
                  {t("forms.field.preset.month", { count: 1 })}
                </Button>
                <Button size="small" onClick={() => applyPreset(90)}>
                  {t("forms.field.preset.month", { count: 3 })}
                </Button>
              </Space>
            </Col>
          </Row>

          <Form.Item
            name={["groups"]}
            labelCol={{ span: 24 }}
            label={
              <Space>
                <Typography.Text>{t("forms.field.groups")}</Typography.Text>
                <Divider type="vertical" />
                <Form.Item noStyle shouldUpdate={(pre, cur) => pre.groups !== cur.groups}>
                  {({ getFieldValue }) => {
                    const groups = getFieldValue("groups") || [];
                    return groups.length ? (
                      <Space>
                        <Typography.Text type="secondary">
                          <Glyph name={"person"} />
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {nbUsersAll} utilisateur(s)
                        </Typography.Text>
                      </Space>
                    ) : (
                      <Typography.Text type="secondary">
                        {t("forms.col.visibility.all")}
                      </Typography.Text>
                    );
                  }}
                </Form.Item>
              </Space>
            }
          >
            <Select
              allowClear
              mode="multiple"
              placeholder={t("forms.field.groups.placeholder")}
              filterOption={false}
              autoClearSearchValue={false}
              onSearch={setSearchGroup}
              onBlur={() => setSearchGroup("")}
              notFoundContent={
                isFetchingGroups ? (
                  <Spin size="small" />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              }
              options={groupOptions}
              optionRender={(option) => (
                <Flex justify="space-between">
                  <Typography.Text>{option.label}</Typography.Text>
                  <Space>
                    <Typography.Text type="secondary">
                      {nbUsers[option.value] ?? "-"}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      <Glyph name={"person"} />
                    </Typography.Text>
                  </Space>
                </Flex>
              )}
            />
          </Form.Item>

          <Form.Item label={t("forms.field.link")} name={["link"]} rules={[{ required: true }]}>
            <Input autoComplete="off" placeholder="https://" />
          </Form.Item>
        </Form>
        <Divider />
      </Modal>
    </>
  );
};

export default FormsRunning;
