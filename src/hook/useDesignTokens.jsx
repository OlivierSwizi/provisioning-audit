import colors from "../assets/token/DT_swizi/web/colors.json";
import shadows from "../assets/token/DT_swizi/web/shadows.json";

for (const [key, value] of Object.entries(colors)) {
  document.documentElement.style.setProperty(`--${key}`, value);
}
document.documentElement.style.setProperty(
  `--shadow`,
  `${shadows.x}px ${shadows.y}px ${shadows.blur}px ${shadows.color}`,
);

const useDesignTokens = () => {
  return { colors, shadows };
};

export default useDesignTokens;
