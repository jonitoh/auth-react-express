import React, { Fragment } from "react";
import DrawerSidebar from "./drawer-sidebar";
import Sidebar from "./sidebar";

export default function ResponsiveSidebar({
  isDrawerOpen,
  onCloseDrawer,
  user,
  navItems,
}) {
  return (
    <Fragment>
      <Sidebar
        onClickMainMenuIcon={() => console.log("nothing to do here")}
        withDrawerOptions={false}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={onCloseDrawer}
        display={{ base: "none", md: "flex" }}
        flexGrow="0"
        flexShrink="1"
        // no flexBasis
        user={user}
        navItems={navItems}
      />
      <DrawerSidebar
        onClickMainMenuIcon={() => console.log("nothing to do here")}
        withDrawerOptions={true}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={onCloseDrawer}
        user={user}
        navItems={navItems}
      />
    </Fragment>
  );
}
