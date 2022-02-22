import React from "react";
import BasicNavItem from "./basic-nav-item";
import LinkedNavItem from "./linked-nav-item";

export default function NavItem({
  icon,
  title,
  active,
  link,
  isSizeSmall,
  onClick,
  withLink = true,
}) {
  const Component = withLink && link ? LinkedNavItem : BasicNavItem;
  return (
    <Component
      {...{
        icon,
        title,
        active,
        link,
        isSizeSmall,
        onClick,
      }}
    />
  );
}
