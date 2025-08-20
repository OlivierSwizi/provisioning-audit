import Joyride from "react-joyride";
import dayjs from "dayjs";
import joyrideLocales from "@/assets/joyride/steps/fr/joyrideLocale";
import { QuestionCircleOutlined } from "@ant-design/icons";
import steps from "@/assets/joyride/steps";
import { useState } from "react";
import { useEffect } from "react";
import { Typography } from "antd";
import config from "@/config";

const SwiziJoyrideTitle = ({ title, screen, style = {}, tag = null }) => {
  const [currentSteps, setCurrentSteps] = useState([]);
  const [joyrideSeen, setJoyrideSeen] = useState({});
  const [hasHelp, setHasHelp] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  useEffect(() => {
    const screenHelp = steps.fr[screen];
    setHasHelp(config.withInlineHelp && !!screenHelp);
    if (!screenHelp) return;

    const joyrideSeen = JSON.parse(localStorage.getItem("joyrideSeen") || "{}");
    setJoyrideSeen(joyrideSeen);

    if (
      !joyrideSeen[screen] ||
      dayjs(joyrideSeen[screen].updateDate).isBefore(dayjs(screenHelp.updateDate))
    ) {
      setCurrentSteps(screenHelp.steps);
      startTour();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTour = () => {
    setRunTour(true);
    setTourKey((prev) => prev + 1);
  };

  const handleJoyrideCallback = (data) => {
    if (!hasHelp) return;
    const { status } = data;
    const finishedStatuses = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      // Mark the tour as seen in local storage
      joyrideSeen[screen] = { updateDate: dayjs().format("YYYYMMDD") };
      localStorage.setItem("joyrideSeen", JSON.stringify(joyrideSeen));
    }
  };

  const handleReplay = () => {
    if (!hasHelp) return;
    setCurrentSteps(steps.fr[screen].steps);
    startTour();
  };

  return (
    <span style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
      <Typography.Title level={3} style={{ ...style }}>
        {title}
      </Typography.Title>
      {tag}
      {hasHelp && (
        <QuestionCircleOutlined
          style={{ marginLeft: "15px", cursor: "pointer" }}
          onClick={handleReplay}
        />
      )}
      {hasHelp && (
        <Joyride
          steps={currentSteps}
          locale={joyrideLocales}
          key={tourKey}
          run={runTour}
          continuous
          showSkipButton
          showProgress
          callback={handleJoyrideCallback}
          styles={{
            options: {
              arrowColor: "#ff4d00",
              backgroundColor: "#ffffff",
              overlayColor: "rgba(255, 255, 255, 0.6)",
              primaryColor: "#ff4d00",
              textColor: "rgba(0, 0, 0, 0.88)",
              width: 500,
              zIndex: 1000,
            },
          }}
        />
      )}
    </span>
  );
};

export default SwiziJoyrideTitle;
