import React from "react";
import { Flex, useDisclosure } from "@chakra-ui/react";
import ResponsiveSidebar from "../sidebar/responsive-sidebar";
import Header from "../header";
import NotificationMenu from "../notification/notification-menu";
import UserProfile from "../user-profile";
import store from "store";
import navItems from "data/nav-items";

// Selectors for extracting global state
const notificationSelector = (state) => state.notifications;
const userSelector = (state) => state.user;
const otherSelector = (state) => ({
  updateNotification: state.updateNotification,
  removeNotification: state.removeNotification,
  hasRight: state.hasRight,
});

export default function MainLayout({ children, showNotification = true }) {
  const user = store.fromSelector(userSelector);
  const notifications = store.fromSelector(notificationSelector);
  const { updateNotification, removeNotification, hasRight } =
    store.fromSelector(otherSelector);

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
