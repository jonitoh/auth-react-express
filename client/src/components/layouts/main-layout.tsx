import React, { ReactNode } from 'react';
import { Flex, useDisclosure } from '@chakra-ui/react';
import store, { GlobalState as State } from '../../store';
import navItems from '../../data/nav-items';
import ResponsiveSidebar from '../sidebar/responsive-sidebar';
import Header from '../header';
import NotificationMenu from '../notification/notification-menu';
import UserProfile from '../user-profile';

type Props = {
  children: ReactNode;
  showNotification?: boolean;
};

// Selectors for extracting global state
const notificationSelector = (state: State) => state.notifications;
const userSelector = (state: State) => state.user;
const otherSelector = (state: State) => ({
  updateNotification: state.updateNotification,
  deleteNotification: state.deleteNotification,
  hasRight: state.hasRight,
});

export default function MainLayout({ children, showNotification }: Props) {
  const user = store.fromSelector(userSelector);
  const notifications = store.fromSelector(notificationSelector);
  const { updateNotification, deleteNotification, hasRight } = store.fromSelector(otherSelector);

  const filteredNavItems = user
    ? navItems.filter((it) => hasRight(user.roleName, it.authRoles))
    : [];
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
              updateOne={updateNotification}
              deleteOne={deleteNotification}
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

MainLayout.defaultProps = {
  showNotification: true,
};
