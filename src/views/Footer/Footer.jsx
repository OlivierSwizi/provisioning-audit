import { Col, Layout, Row } from "antd";

const Footer = () => {
  return (
    <Layout.Footer>
      <Row style={{ width: "100%" }}>
        <Col span={2} offset={22}>
          {import.meta.env.REACT_APP_VERSION}
        </Col>
      </Row>
    </Layout.Footer>
  );
};
export default Footer;
