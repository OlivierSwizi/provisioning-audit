import { NavLink } from "react-router-dom";
import cx from "clsx";

import "./Tile.scss";

const Tile = ({ children, href, onClick, className, style, disabled }) => {
  const El = href ? NavLink : "div";
  return (
    <El
      to={href}
      className={cx("tile", className, { disabled: disabled })}
      style={style}
      onClick={onClick ? onClick : null}
      disabled={disabled}
    >
      {children}
    </El>
  );
};

export default Tile;
