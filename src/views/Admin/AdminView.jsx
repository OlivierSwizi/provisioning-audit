import * as R from "ramda";

import { useWorkDispatch } from "@/services/features/UISlice";
import { Button, Card, Checkbox, Col, Form, message, Row, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  createUser,
  loadConfig,
  loadUserList,
  loadUserPermissions,
  saveUserPermissions,
} from "../../services/features/AdminSlice";
import AdminAppList from "./AdminAppList";
import AdminSiteList from "./AdminSiteList";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { useUserAdminModal } from "@/components/modal/UserAdminModal";
import logger from "@/logger";

const AdminView = () => {
  const workDispatch = useWorkDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [askUserAdminModal, UserAdminModal] = useUserAdminModal();

  const { userList } = useSelector((state) => state.admin);
  const config = useSelector((state) => state.admin.config);

  const [userEmail, setUserEmail] = useState();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const [allApps, setAllApps] = useState(false);
  const [operations, setOperations] = useState([]);
  const [scoped, setScoped] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [isBusinessRole, setIsBusinessRole] = useState(false);
  const [appList, setAppList] = useState([]);
  const [editing, setEditing] = useState(false);

  const ProvCard = (props) => (
    <Card
      {...props}
      style={{ marginTop: "20px" }}
      bodyStyle={{ padding: "5px 16px 2px 16px" }}
      headStyle={{ padding: "5px 16px 6px 16px" }}
      title={
        <span style={{ fontSize: "16px", fontWeight: "bold", padding: "2px 16px" }}>
          {props.title || ""}
        </span>
      }
      bordered={false}
    />
  );

  const ProvFormItem = (props) => <MultiLineFormItem {...props} style={{ marginBottom: "5px" }} />;

  useEffect(() => {
    workDispatch(loadUserList());
    workDispatch(loadConfig());
  }, [workDispatch]);

  useEffect(() => {
    if (config && config.operations) {
      const operations = R.clone(config.operations).sort((op1, op2) => {
        if (op1.external && !op2.external) {
          return -1;
        }
        if (!op1.external && op2.external) {
          return 1;
        }
        return op1.label.localeCompare(op2.label);
      });
      setOperations([{ key: "full", label: "Tous les droits" }, ...operations]);
    }

    if (config && config.apps) {
      setAppList(config.apps);
    }
  }, [config]);

  const handleChange = async (email) => {
    setUserEmail(email);
    setEditing(false);

    const permissions = await workDispatch(loadUserPermissions(email));
    setIsSuperAdmin(permissions.superAdmin);
    setFullAccess(permissions.scopes[0] === "full");
    setAllApps(permissions.all);
    setScoped(permissions.scopes.length > 0);
    setIsBusinessRole(permissions.businessProfile);
    setSelectedApps(permissions.apps);

    const sites = [];
    for (const app of config.apps) {
      for (const site of app.sites) {
        sites.push({
          appId: app.id,
          value: site.id,
          label: `${app.label} - ${site.label}`,
        });
      }
    }

    setSiteList(sites);

    const data = {
      superAdmin: permissions.superAdmin,
      businessProfile: permissions.businessProfile,
      standardProfile: !permissions.superAdmin && !permissions.businessProfile,
      vendors: permissions.vendors,
      apps: permissions.apps,
      all: permissions.all,
      restrictedSitesList: permissions.restrictedSitesList || [],
    };

    for (let ope of operations) {
      data[ope.key] = permissions.scopes.includes(ope.key);
    }

    form.setFieldsValue(data);
  };

  const handleSubmit = async (values) => {
    const data = {
      superAdmin: values.superAdmin,
      businessProfile: values.businessProfile,
      all: values.all,
      apps: values.apps,
      restrictedSitesList: values.restrictedSitesList.map((rs) => rs.siteId),
      scopes: values.full ? ["full"] : [],
      vendors: values.vendors,
    };

    config.operations.forEach((op) => {
      if (values[op.key]) {
        data.scopes.push(op.key);
      }
    });

    try {
      await workDispatch(saveUserPermissions(userEmail, data));
      message.success(t("admin.provisioning-user-saved"));
    } catch (error) {
      logger.error(error);
      message.error(t("admin.provisioning-user-error"));
    }

    handleChange(userEmail);
  };

  const handleValueChange = (changedValues, allValues) => {
    setEditing(true);
    setIsSuperAdmin(allValues.superAdmin);
    setFullAccess(allValues.full);
    setAllApps(allValues.all);
    setScoped(allValues.vendors.length > 0);
    setIsBusinessRole(allValues.businessProfile);
    setSelectedApps(allValues.apps);

    if (changedValues.apps) {
      // must remove sites selected which are linked to removed apps
      const restrictedSitesList = allValues.restrictedSitesList.filter((rs) => {
        const detailledSite = siteList.find((site) => site.value === rs);
        if (detailledSite) return changedValues.apps.includes(detailledSite.appId);
        else return [];
      });
      form.setFieldsValue({ restrictedSitesList });
    }

    if (changedValues.standardProfile === true) {
      const toChange = {
        superAdmin: false,
        businessProfile: false,
        full: false,
        vendors: [],
        apps: [],
      };
      form.setFieldsValue(toChange);
      handleValueChange(toChange, { ...allValues, ...toChange });
    }

    if (changedValues.businessProfile === true) {
      const toChange = { superAdmin: false, standardProfile: false };
      form.setFieldsValue(toChange);
      handleValueChange(toChange, { ...allValues, ...toChange });
    }

    if (changedValues.superAdmin === true) {
      const toChange = {
        full: false,
        vendors: [],
        apps: [],
        businessProfile: false,
        standardProfile: false,
      };
      form.setFieldsValue(toChange);
      handleValueChange(toChange, { ...allValues, ...toChange });
    }
  };

  const handleAddUser = async () => {
    const user = await askUserAdminModal();
    if (user) {
      try {
        workDispatch(createUser(user));
        message.success(t("admin.account-created"));
      } catch (error) {
        if (error?.response?.status === 409) message.error(t("admin.email-already-exists"));
        else message.error(t("admin.provisioning-user-error"));
      }
    }
  };

  return (
    <>
      {UserAdminModal}
      <Row gutter={[20, 20]}>
        <Col span={18}>
          <Typography.Title level={2}>{t("admin.provisioning-user-administration")}</Typography.Title>
        </Col>
        <Col flex={"auto"}>
          <Select
            showSearch
            style={{ width: 500 }}
            placeholder={t("admin.select-user")}
            optionFilterProp="children"
            onChange={handleChange}
            value={userEmail}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={userList
              .map((u) => ({
                label: `${u.lastName} ${u.firstName} (${u.email})`,
                value: u.email,
              }))
              .sort(
                (a, b) =>
                  /^\d/.test(a.label.charAt(0)) - /^\d/.test(b.label.charAt(0)) ||
                  a.label.charAt(0).localeCompare(b.label.charAt(0)),
              )}
          />
        </Col>
        {!editing && (
          <Col span={3}>
            <Button onClick={handleAddUser}>{t("admin.add-new-user")}</Button>
          </Col>
        )}

        {userEmail && (
          <Row style={{ width: "100%" }}>
            {editing && (
              <Col span={24} style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  style={{ width: "250px", marginRight: "25px" }}
                  size="middle"
                  onClick={() => handleChange(userEmail)}
                >
                  {t("admin.cancel")}
                </Button>
                <Button
                  type="primary"
                  style={{ width: "250px" }}
                  size="middle"
                  onClick={() => form.submit()}
                >
                  {t("components.save")}
                </Button>
              </Col>
            )}
            <Col span={24}>
              <Form
                form={form}
                onFinish={handleSubmit}
                onValuesChange={handleValueChange}
                labelCol={{
                  span: 12,
                }}
                wrapperCol={{
                  offset: 1,
                  span: 3,
                }}
                layout="horizontal"
              >
                <Row style={{ width: "100%" }}>
                  <Col span={24}>
                    <ProvCard title={t("admin.provisioning-user-profile")}>
                      <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "wrap" }}>
                        <Col span={6}>
                          <ProvFormItem
                            label={t("admin.provisioning-user-normal-role")}
                            valuePropName="checked"
                            name="standardProfile"
                          >
                            <Checkbox />
                          </ProvFormItem>
                        </Col>
                        <Col span={6}>
                          <ProvFormItem
                            label={t("admin.provisioning-user-business-role")}
                            valuePropName="checked"
                            name="businessProfile"
                          >
                            <Checkbox />
                          </ProvFormItem>
                        </Col>
                        <Col span={6}>
                          <ProvFormItem
                            label={t("admin.provisioning-user-super-admin")}
                            valuePropName="checked"
                            name="superAdmin"
                          >
                            <Checkbox />
                          </ProvFormItem>
                        </Col>
                      </Row>
                    </ProvCard>
                  </Col>

                  <Col span={24} hidden={isSuperAdmin}>
                    <ProvCard title={t("admin.provisioning-user-permissions")}>
                      <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "wrap" }}>
                        {(operations || [])
                          .filter((op) => {
                            if (fullAccess && op.key !== "full") return false;
                            return true;
                          })
                          .map((op) => (
                            <Col key={op.key} xs={24} sm={12} md={8} lg={4}>
                              <ProvFormItem
                                wrapperCol={{ offset: 1, span: 5 }}
                                labelCol={{ span: 18 }}
                                key={op.key}
                                label={t(op.label)}
                                valuePropName="checked"
                                name={op.key}
                              >
                                <Checkbox />
                              </ProvFormItem>
                            </Col>
                          ))}
                      </Row>
                    </ProvCard>
                  </Col>

                  <Col span={24} hidden={isSuperAdmin || isBusinessRole}>
                    <ProvCard title={t("admin.provisioning-grouped-permission")}>
                      <Row style={{ width: "100%" }}>
                        <Col span={24} style={{ display: "flex" }}>
                          <Form.Item
                            colon={false}
                            style={{ width: "400px" }}
                            label={t("admin.admin-all-apps")}
                            wrapperCol={{ offset: 1, span: 17 }}
                            labelCol={{ span: 6 }}
                            name={"all"}
                            valuePropName="checked"
                          >
                            <Checkbox />
                          </Form.Item>
                          <Form.Item
                            hidden={allApps}
                            colon={false}
                            style={{ width: "700px" }}
                            wrapperCol={{ offset: 1, span: 17 }}
                            labelCol={{ span: 6 }}
                            name={"vendors"}
                            label={t("admin.admin-vendors")}
                          >
                            <Select
                              mode="multiple"
                              size="middle"
                              style={{
                                width: "250px",
                              }}
                              options={config.vendors.map((v) => ({
                                value: v.key,
                                label: v.label,
                              }))}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </ProvCard>
                  </Col>
                  <Col
                    span={14}
                    style={{ marginTop: "20px" }}
                    hidden={isSuperAdmin || allApps || scoped.length > 0}
                  >
                    <Form.Item
                      colon={false}
                      label={null}
                      name="apps"
                      wrapperCol={{
                        offset: 0,
                        span: 24,
                      }}
                    >
                      <AdminAppList allAppList={appList} />
                    </Form.Item>
                  </Col>
                  <Col
                    span={9}
                    offset={1}
                    style={{ marginTop: "20px" }}
                    hidden={isSuperAdmin || allApps || scoped.length > 0 || !isBusinessRole}
                  >
                    <Form.Item
                      colon={false}
                      label={null}
                      name="restrictedSitesList"
                      wrapperCol={{
                        offset: 0,
                        span: 24,
                      }}
                    >
                      <AdminSiteList allSiteList={siteList} selectedApps={selectedApps} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        )}
      </Row>
    </>
  );
};

export default AdminView;
