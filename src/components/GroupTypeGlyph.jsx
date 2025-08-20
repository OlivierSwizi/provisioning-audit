import Glyph from "@/common/Glyph";
import useDesignTokens from "@/hook/useDesignTokens";

const GroupTypeGlyph = ({ group }) => {
  const { colors } = useDesignTokens();

  return (
    <Glyph
      style={{
        marginRight: "8px",
        verticalAlign: "-4px",
        fontWeight: "normal",
        color: colors.secondary_base,
      }}
      name={group.type === "COMPOSIT" ? "folder_open" : "group"}
    />
  );
};

export default GroupTypeGlyph;
