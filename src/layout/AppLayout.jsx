import * as R from "ramda";
import Glyph from "@/common/Glyph";
import MainLoader from "@/common/MainLoader/MainLoader";
import useAppList from "@/hook/useAppList";
import TopBar from "@/views/Header/TopBar";
import { Layout, Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, Outlet, useMatches } from "react-router-dom";
import { appRoutes } from "./router";

const LeftSider = () => {
  const { t } = useTranslation();
  const matches = useMatches();

  const appId = useSelector((state) => state.apps.selectedApp?.id);
  const useCM = useSelector((state) => state.apps.selectedApp?.useCM);

  const appVendor = useSelector((state) => state.apps.selectedApp?.vendor);
  const access = useSelector((state) => state.auth.access);

  const itemsRoutes = useMemo(() => {
    const menus = [];

    const filtered = appRoutes
      .filter(
        (item) =>
          (R.isNil(item.CMRequired) && R.isNil(item.CMForbidden)) ||
          (item.CMRequired && useCM) ||
          (item.CMForbidden && !useCM),
      )
      .filter((item) => item.handle?.inMenu)
      .filter(({ handle: { roles } }) => {
        if (!roles || !roles.length) return true;
        const [role, level] = roles;
        const requireBusinessProfile = level === "business";
        const requiredStandardRole = level !== "business";
        const canBeUsedWithAllLevels = level === "all";

        if (access.superAdmin && !requireBusinessProfile) return true;

        // check scopes
        if (requireBusinessProfile && !access.businessProfile) return false;
        if (!canBeUsedWithAllLevels && requiredStandardRole && access.businessProfile) return false;

        if (!access.scopes.includes(`${role}`) && !access.scopes.includes(`full`)) return false;

        // check app validity
        if (access.all) return true;
        if (access.vendors.includes(appVendor)) return true;
        if (access.apps.includes(appId)) return true;

        return false;
      });

    filtered.forEach((route) => {
      if (!route.handle.parent)
        menus.push({
          key: route.handle.key,
          icon: route.handle.icon ? (
            <Glyph name={route.handle.icon} style={{ fontSize: 16 }} />
          ) : undefined,
          label: <Link to={route.path}>{t(route.handle.label)}</Link>,
        });
      else {
        let parent = menus.find((menu) => menu.key === route.handle.parent);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push({
            key: route.handle.key,
            icon: route.handle.icon ? (
              <Glyph name={route.handle.icon} style={{ fontSize: 16 }} />
            ) : undefined,
            label: <Link to={route.path}>{t(route.handle.label)}</Link>,
          });
        }
      }
    });

    return menus;
  }, [access, appId, appVendor, t]);

  return (
    <Menu
      mode="inline"
      selectedKeys={[matches[matches.length - 1]?.handle?.key]}
      style={{}}
      items={itemsRoutes}
    />
  );
};

const AppLayout = () => {
  const loaded = useAppList();

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MainLoader />

      <Layout style={{ height: "100%" }}>
        <Layout.Header style={{ background: "white", zIndex: 1 }}>
          <TopBar />
        </Layout.Header>

        <Layout>
          <Layout.Sider theme="light" width={250} style={{ paddingTop: "1rem" }}>
            <LeftSider />
          </Layout.Sider>

          <Layout>
            <Layout.Content style={{ overflowY: "auto", padding: "2rem" }}>
              <Layout style={{ width: "100%" }}>{loaded && <Outlet />}</Layout>
            </Layout.Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
};

export default AppLayout;
