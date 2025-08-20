import { LogoutOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Divider,
  Dropdown,
  Image,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo_swizi.png";
import { selectApp } from "../../services/features/AppsSlice";
import { useWorkDispatch } from "@/services/features/UISlice";
import { useState } from "react";
import config from "@/config";
import { useAuth } from "react-oidc-context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "@/styles/topbar.css";
import TopbarLink from "@/components/TopbarLink";

const TopBar = () => {
  const auth = useAuth();
  const workDispatch = useWorkDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [aboutVisible, setAboutVisible] = useState(false);

  const authInfos = useSelector((state) => state.auth);
  const { displayName } = authInfos;

  const isAdmin = useSelector((state) => state.auth.access?.superAdmin);
  const selectedApp = useSelector((state) => state.apps.selectedApp);
  const appList = useSelector((state) => state.apps.appList || []);

  const handleMenuClick = (item) => {
    switch (item.key) {
      case "quit":
        auth.signoutRedirect();
        break;
      case "dbrm":
        window.open(import.meta.env.REACT_APP_DBRM_URL, "_blank", "noreferrer");
        break;
      case "monitor":
        window.open(import.meta.env.REACT_APP_MONITOR_URL, "_blank", "noreferrer");
        break;
      case "simulator":
        window.open(import.meta.env.REACT_APP_SIMULATOR_URL, "_blank", "noreferrer");
        break;
      case "ticketing":
        window.open(import.meta.env.REACT_APP_TICKETING_URL, "_blank", "noreferrer");
        break;
      case "about":
        setAboutVisible(true);
        break;
      default:
        break;
    }
  };

  const menuProps = {
    items: [
      {
        label: t("header.about"),
        key: "about",
      },
      {
        label: displayName,
        key: "name",
      },

      {
        label: t("header.quit"),
        key: "quit",
        icon: <LogoutOutlined />,
      },
    ],
    onClick: handleMenuClick,
  };

  const menuLinks = {
    items: [
      {
        label: "DBRM",
        key: "dbrm",
      },

      {
        label: t("header.monitor"),
        key: "monitor",
      },
      {
        label: t("header.simulator"),
        key: "simulator",
      },
      {
        label: t("header.ticketing"),
        key: "ticketing",
      },
    ],
    onClick: handleMenuClick,
  };

  const onChange = async (value) => {
    await workDispatch(selectApp(value));
    navigate(`/apps/${value}`);
  };

  const onSearch = () => {};

  return (
    <Row gutter={[20, 20]} align="middle" style={{ width: "100%", height: "100%" }}>
      <Modal
        title={t("header.about")}
        open={aboutVisible}
        onOk={() => setAboutVisible(false)}
        onCancel={() => setAboutVisible(false)}
      >
        <Row style={{ width: "100%" }}>
          <Col span={12}>
            <Typography.Text strong>Version</Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{config.version}</Typography.Text>
          </Col>
        </Row>
        <Divider />
        <Row style={{ width: "100%" }}>
          <Col span={12}>
            <Typography.Text strong>Endpoint</Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{config.endpoint}</Typography.Text>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={12}>
            <Typography.Text strong>Environment</Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{authInfos.env}</Typography.Text>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={12}>
            <Typography.Text strong>Tenant</Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{authInfos.tenant}</Typography.Text>
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col span={12}>
            <Typography.Text strong>Access</Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{JSON.stringify(authInfos.access)}</Typography.Text>
          </Col>
        </Row>
      </Modal>
      <Col style={{ height: "100%" }}>
        <Image
          src={logo}
          preview={false}
          height={"100%"}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/`)}
        />
      </Col>
      <Col>
        {appList.length > 0 && (
          <Select
            showSearch
            style={{ width: 250 }}
            placeholder="Select a project"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            value={selectedApp?.id}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={appList.map((u) => ({ label: u.name, value: u.id }))}
          />
        )}
      </Col>
      <Col flex={"auto"} />
      {isAdmin && (
        <>
          <Col>
            <TopbarLink onClick={() => navigate("/admin/audience")}>
              {t("header.global-tenant-audience")}
            </TopbarLink>
          </Col>
          <Col>
            <TopbarLink onClick={() => navigate("/admin")}>
              {t("header.provisioning-users-management")}
            </TopbarLink>
          </Col>
        </>
      )}
      <Col>
        <Dropdown key="links" menu={menuLinks}>
          <Button size={"middle"}>Liens</Button>
        </Dropdown>
      </Col>
      <Col>
        <LanguageSwitcher />
      </Col>
      <Col>
        <Dropdown key="more" menu={menuProps}>
          <Avatar>{displayName?.charAt(0).toUpperCase()}</Avatar>
        </Dropdown>
      </Col>
    </Row>
  );
};
export default TopBar;
