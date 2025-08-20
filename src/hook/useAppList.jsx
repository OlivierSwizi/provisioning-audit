import { selectApp, loadAppList } from "@/services/features/AppsSlice";
import { useWorkDispatch } from "@/services/features/UISlice";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const useAppList = () => {
  const workDispatch = useWorkDispatch();
  const navigate = useNavigate();
  const { appId } = useParams();

  const [loadedList, setLoadedList] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    workDispatch(loadAppList()).then(() => setLoadedList(true));
  }, [workDispatch]);

  useEffect(() => {
    if (!loadedList) return;

    if (appId) {
      workDispatch(selectApp(appId))
        .catch(() => {
          navigate("/");
        })
        .finally(() => {
          setLoaded(true);
        });
    } else {
      setLoaded(true);
    }
  }, [appId, loadedList, navigate, workDispatch]);

  return loaded;
};

export default useAppList;
