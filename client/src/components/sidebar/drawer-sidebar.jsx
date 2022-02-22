import Sidebar from "./sidebar";
import { Drawer, DrawerContent } from "@chakra-ui/react";

export default function DrawerSidebar({
  onClickMainMenuIcon = () => null,
  withDrawerOptions = false,
  isDrawerOpen,
  onCloseDrawer,
  user,
  navItems,
}) {
  return (
    <Drawer
      autoFocus={false}
      isOpen={isDrawerOpen}
      placement="left"
      onClose={onCloseDrawer}
      blockScrollOnMount={false}
      isFullHeight={true}
      size="full"
      flexGrow="0"
      flexShrink="1"
      // no flexBasis
    >
      <DrawerContent overflow="scroll">
        <Sidebar
          onClickMainMenuIcon={onClickMainMenuIcon}
          withDrawerOptions={withDrawerOptions}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={onCloseDrawer}
          user={user}
          navItems={navItems}
          boxShadow={undefined}
          w="100%"
        />
      </DrawerContent>
    </Drawer>
  );
}
