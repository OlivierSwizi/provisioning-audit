// FILENAME: src/views/AppsList/AppList.jsx
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Typography, Row, Col, Input } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ViewModeToggle from "@/components/ViewModeToggle";
import { useUserPref } from "@/utils/userPrefs";
import AppsGrid from "./components/AppsGrid";
import AppsListRows from "./components/AppsListRows";

const { Title } = Typography;

export default function AppList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const apps = useSelector((state) => state.apps.appList);

  // Préférences utilisateur: vue grid/list
  const [viewMode, setViewMode] = useUserPref("appListViewMode", "grid");

  // Recherche locale (garde ta logique si différente)
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return (apps || []).filter((a) => {
      const hay = `${a?.name ?? ""} ${String(a?.id ?? "")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [apps, query]);

  // Ouverture d'une app (garde ta navigation existante)
  const openApp = (app) => {
    if (!app) return;
    // Ex: navigate(`/apps/${app.id}`);
    navigate(`/apps/${app.id}`);
  };

  return (
    <div style={{ width: "100%" }}>
      <Row align="middle" gutter={[12, 12]} style={{ marginBottom: 8 }}>
        <Col flex="auto">
          <Title level={3} style={{ margin: 0 }}>
            {t("apps-list.apps", "Projects")}
          </Title>
        </Col>
        <Col>
          <Input.Search
            allowClear
            placeholder={t("apps-list.search-app", "Search a project")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 320, maxWidth: "70vw" }}
          />
        </Col>
        <Col>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        {viewMode === "grid" ? (
          <AppsGrid items={filtered} onOpen={openApp} />
        ) : (
          <AppsListRows items={filtered} onOpen={openApp} />
        )}
      </div>
    </div>
  );
}
