const colors = require(`../../assets/token/DT_swizi/web/colors.json`);
const symbols = require(`../../assets/token/DT_swizi/web/symbols.json`);
const shadow = require(`../../assets/token/DT_swizi/web/shadows.json`);

// https://github.com/ant-design/ant-design/blob/4.x-stable/components/style/themes/default.less
module.exports = {
  "@root-entry-name": "default",
  ...Object.fromEntries(Object.entries(colors).map(([key, val]) => [`@${key}`, val])),
  "@shadow-size": `${shadow.blur}px`,

  "@primary-color": colors.primary_base,
  "@secondary-color": colors.secondary_base,
  "@success-color": colors.success_light,

  "@layout-body-background": colors.light_background,
  "@component-background": colors.tiles_color,

  "@border-radius-base": symbols.base_shape.radius + "px",
  "@box-shadow-base": `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`, // Autre variable exist déjà
  "@border-width-base": "2px",

  "@height-lg": "48px",

  // Unknown variables
  "@border-radius-button": symbols.button_shape.radius + "px", // Autre variable exist déjà
  "@shadow": `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`, // Autre variable exist déjà

  "@btn-primary-bg": colors.secondary_base,
  "@btn-primary-color": `contrast(${colors.secondary_base})`,
  "@btn-primary-shadow": "none",

  "@btn-default-color": colors.secondary_base,
  "@btn-default-bg": "transparent",
  "@btn-default-border": colors.secondary_base,

  "@btn-default-ghost-color": colors.interactive_03,
  "@btn-default-ghost-bg": "transparent",
  "@btn-default-ghost-border": colors.interactive_03,

  "@btn-danger-color": "white",
  "@btn-danger-bg": colors.error_light,
  "@btn-danger-border": "none",

  "@btn-text-shadow": "none",
  "@btn-border-radius-base": symbols.button_shape.radius + "px",
  "@btn-font-weight": "bold",

  "@layout-header-background": colors.light_background,
  "@layout-header-height": "80px",
  "@layout-sider-background": "white",

  "@menu-bg": "white",
  "@menu-item-color": colors.primary_dark,
  "@menu-icon-size": "16px",
  "@menu-icon-margin-right": "8px",
  "@menu-highlight-color": colors.secondary_base,
  "@menu-item-active-bg": colors.grey_20,
  "@menu-item-active-border-width": "0px",

  "@card-head-height": "70px",
  "@card-shadow": `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`,
  "@card-radius": symbols.base_shape.radius + "px",
  "@card-padding-base": "16px",

  "@modal-body-padding": "35px",
  "@modal-header-padding": "16px",
  "@modal-footer-padding-vertical": "16px",
  "@modal-header-close-size": "24px",

  "@checkbox-border-radius": "2px",

  "@radio-border-width": "2px",
  "@radio-dot-color": colors.secondary_base,

  "@radio-button-bg": "white",
  "@radio-button-color": colors.primary_dark,
  "@radio-button-hover-color": colors.primary_base,
  "@radio-button-active-color": colors.primary_base,
  "@radio-button-checked-bg": "white",
  "@radio-disabled-button-checked-color": colors.primary_base,

  "@select-item-selected-bg": colors.secondary_base,
  "@select-item-selected-color": "white",

  "@tabs-card-head-background": colors.grey_40,
  "@tabs-card-height": "32px",

  "@tag-default-bg": colors.interactive_03,
  "@tag-default-color": "white",

  "@collapse-header-bg": colors.light_background,
  "@collapse-content-bg": colors.light_background,

  "@picker-date-hover-range-color": colors.secondary_base,
  "@picker-time-panel-column-width": "70px",
  "@picker-time-panel-column-height": "120px",
  "@picker-bg": colors.light_background,

  "@progress-default-color": colors.secondary_base,

  "@divider-color": colors.grey_20,

  // "@table-bg": colors.tiles_color,
  // "@table-header-bg": colors.tiles_color,
  // "@table-header-filter-active-bg": "inherit",
  // "@table-body-sort-bg": "transparent",
  "@table-header-bg": colors.grey_80,
  "@table-header-color": "white",
  "@table-header-sort-active-bg": colors.grey_80,

  "@avatar-bg": colors.grey_20,
  "@avatar-color": "black",

  "@segmented-bg": colors.grey_20,
  "@segmented-selected-bg": colors.tiles_color,
  "@segmented-label-hover-color": colors.primary_dark,
  "@segmented-label-color": colors.primary_dark,

  "@badge-font-weight": "bold",
  "@badge-color": colors.secondary_base,
};
