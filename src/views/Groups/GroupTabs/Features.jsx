import Glyph from "@/common/Glyph";
import { Button, Card, Checkbox, Col, Form, Row, Space, Typography } from "antd";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Features = ({ group, onUpdateFeaturesConfig }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleUpdateFeatureConfig = async () => {
    onUpdateFeaturesConfig({
      unifiedQrCode: {
        enabled: form.getFieldValue("unifiedQRCode"),
      },
    });
  };

  useEffect(() => {
    if (!group) return;
    form.setFieldsValue({
      unifiedQRCode: !!group.featureConfig?.unifiedQrCode?.enabled,
    });
  }, [form, group]);

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
      extra={
        <Space>
          <Button type="primary" onClick={() => form.submit()} icon={<Glyph type="save" />}>
            {t("save")}
          </Button>
        </Space>
      }
    >
      <Row gutter={[10, 10]}>
        <Col span={22}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("authorized-features")}
          </Typography.Title>
        </Col>
        <Col span={22} style={{ padding: "15px 0 0 0" }}>
          <Form layout="inline" onFinish={handleUpdateFeatureConfig} form={form}>
            <Form.Item label={t("unifiedQRCode")} name="unifiedQRCode" valuePropName="checked">
              <Checkbox />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default Features;
