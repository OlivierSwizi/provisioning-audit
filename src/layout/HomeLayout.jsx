import MainLoader from "@/common/MainLoader/MainLoader";
import useAppList from "@/hook/useAppList";
import TopBar from "@/views/Header/TopBar";
import { Layout } from "antd";
import { Outlet, useNavigate, useOutlet } from "react-router-dom";

const HomeLayout = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const loaded = useAppList();

  logger.log("HomeLayout", { loaded, outlet });

  if (loaded && !outlet) {
    navigate("/");
  }

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MainLoader />

      <Layout style={{ height: "100%" }}>
        <Layout.Header style={{ background: "white", zIndex: 1 }}>
          <TopBar />
        </Layout.Header>

        <Layout>
          <Layout.Content style={{ overflowY: "auto", padding: "2rem" }}>
            <Layout style={{ margin: "auto", width: "min(1200px, 100%)" }}>
              {loaded && <Outlet />}
            </Layout>
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default HomeLayout;
