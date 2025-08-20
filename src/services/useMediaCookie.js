import { useEffect } from "react";
import { useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";

const useMediaCookie = (expiresInMin = 10) => {
  const api = useSelector(API);
  const appId = useSelector((state) => state.apps.selectedApp.id);

  useEffect(() => {
    let isMounted = true;

    const refreshCookie = async () => {
      if (!isMounted || !appId) return;
      await api.media.getMediaCookie();

      if (isMounted) {
        // Planifie le prochain refresh un peu avant l’expiration
        setTimeout(refreshCookie, (expiresInMin - 1) * 60 * 1000);
      }
    };

    // Premier appel direct
    refreshCookie();

    return () => {
      isMounted = false;
    };
  }, [api.media, appId, expiresInMin]);
};

export default useMediaCookie;
