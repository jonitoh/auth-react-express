import React from "react";
import { Flex, useDisclosure } from "@chakra-ui/react";
import ResponsiveSidebar from "../sidebar/responsive-sidebar";
import Header from "../header";
import NotificationMenu from "../notification/notification-menu";
import UserProfile from "../user-profile";
import { useStoreFromSelector } from "store";
import navItems from "data/nav-items";

// Selectors for extracting global state
const useStoreSelector = (state) => ({
  hasRight: state.hasRight,
  updateNotification: state.updateNotification,
  removeNotification: state.removeNotification,
});
const userSelector = (state) => state.user;
const notificationsSelector = (state) => state.notifications;

export default function MainLayout({ children, showNotification = true }) {
  const { hasRight, updateNotification, removeNotification } =
    useStoreFromSelector(useStoreSelector);
  const user = useStoreFromSelector(userSelector);
  const notifications = useStoreFromSelector(notificationsSelector);

  const filteredNavItems = navItems.filter((it) =>
    hasRight(user.roleName, it.authRoles)
  );
  // For sidebar functionality
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex bg="palette.primary-4" flexDirection="row" h="100%" overflow="scroll">
      <ResponsiveSidebar
        isDrawerOpen={isOpen}
        onCloseDrawer={onClose}
        user={user}
        navItems={filteredNavItems}
      />
      <Flex // pageWrapper
        flexDirection="column"
        flexBasis="100%"
        flexGrow="auto"
        minH="100vh"
      >
        <Header onOpenDrawer={onOpen}>
          {showNotification && (
            <NotificationMenu
              notifications={notifications}
              updateNotification={updateNotification}
              removeNotification={removeNotification}
            />
          )}
          <UserProfile user={user} />
        </Header>
        <Flex // contentWrapper
          flexGrow="100"
          flexBasis="80%"
          h="100%"
          bg="white"
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}
