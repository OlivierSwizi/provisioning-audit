import Glyph from "@/common/Glyph";
import TranslatedLabel from "@/components/TranslatedLabel";
import I18nInput from "@/components/UI/Inputs/I18nInputs/I18nInput";
import logger from "@/logger";
import { groupedForms } from "@/services/features/FormSlice";
import { EditOutlined, ExportOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { reduce } from "ramda";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

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

  const [, forms] = useSelector(groupedForms);

  const [locale, setlocale] = useState(LOCALES[0].value);
  const [selectedForm, setSelectedForm] = useState();
  const [nbUsers, setNbUsers] = useState({});

  useEffect(() => {
    setNbUsers((prev) => ({
      ...prev,
      ...(selectedForm?.groups || []).reduce((c, i) => ({ ...c, [i.id]: i.nbUsers }), {}),
    }));
  }, [selectedForm?.groups]);

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
        dataIndex: "groups",
        render: (groups) => {
          const nbUsers = (groups || []).reduce((c, i) => c + (i.nbUsers || 0), 0);
          return (
            <Space>
              <Typography.Text type="secondary">
                <Glyph name={"person"} />
              </Typography.Text>
              <Typography.Text style={{ whiteSpace: "nowrap" }} type="secondary">
                {groups?.length ? nbUsers : t("forms.col.visibility.all")}
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
              {t("forms.details")}
            </Button>
            <Button icon={<ExportOutlined />} type="link" href={record.link} target="_blank">
              {t("forms.open")}
            </Button>
          </Space>
        ),
      },
    ];
  }, [t]);

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ overflow: "hidden" }}
            styles={{ body: { padding: 0, overflowX: "auto" } }}
          >
            <Table
              style={{ width: "100%" }}
              rowKey="id"
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
        title={t("forms.details.title")}
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
        <Form disabled layout="vertical" form={form}>
          <Form.Item label={t("forms.field.name")} name={["name"]}>
            <I18nInput locale={locale} />
          </Form.Item>

          <Row gutter={[20, 0]}>
            <Col span={12}>
              <Form.Item label={t("forms.field.startDate")} name={["startDate"]}>
                <DatePicker
                  style={{ width: "100%" }}
                  showTime={{
                    showSecond: false,
                    minuteStep: 15,
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("forms.field.endDate")} name={["endDate"]}>
                <DatePicker
                  style={{ width: "100%" }}
                  showTime={{
                    showSecond: false,
                    minuteStep: 15,
                  }}
                />
              </Form.Item>
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
                    const getNb = (group) =>
                      (typeof group === "number" ? nbUsers[group] : nbUsers[group.value]) || 0;
                    return groups.length ? (
                      <Space>
                        <Typography.Text type="secondary">
                          <Glyph name={"person"} />
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {reduce((c, i) => c + getNb(i), 0, groups)} utilisateur(s)
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
            <Select mode="multiple" />
          </Form.Item>

          <Form.Item label={t("forms.field.link")} name={["link"]}>
            <Input autoComplete="off" placeholder="https://" />
          </Form.Item>
        </Form>
        <Divider />
      </Modal>
    </>
  );
};

export default FormsRunning;
