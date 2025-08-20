import { isLoading } from "@/services/features/UISlice";
import { useSelector } from "react-redux";
import { BarLoader } from "react-spinners";

const MainLoader = () => {
  const loading = useSelector(isLoading);

  if (!loading) return null;
  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          background: "white",
          opacity: "0.5",
          zIndex: 10000,
        }}
      />
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 10001,
        }}
      >
        <BarLoader color="#f89838" height={5} width={"100%"} />
      </div>
    </>
  );
};

export default MainLoader;
