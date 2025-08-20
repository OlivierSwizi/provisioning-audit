import "./Glyph.scss";
import cx from "clsx";

const Glyph = ({ name, className, ...rest }) => {
  return (
    <i {...rest} className={cx("glyph", className)}>
      {name}
    </i>
  );
};

export default Glyph;
