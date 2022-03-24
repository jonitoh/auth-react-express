import React from 'react';
import DrawerSidebar from './drawer-sidebar';
import Sidebar from './sidebar';
import { NavItem as NavItemType } from '../../data/nav-items';
import { User } from '../../store/user.slice';

type Props = {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  user: User | null;
  navItems: NavItemType[];
};

function ResponsiveSidebar({ isDrawerOpen, onCloseDrawer, user, navItems }: Props) {
  return (
    <>
      <Sidebar
        onClickMainMenuIcon={() => console.warn('nothing to do here')}
        withDrawerOptions={false}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={onCloseDrawer}
        display={{ base: 'none', md: 'flex' }}
        flexGrow="0"
        flexShrink="1"
        // no flexBasis
        user={user}
        navItems={navItems}
      />
      <DrawerSidebar
        onClickMainMenuIcon={() => console.warn('nothing to do here')}
        withDrawerOptions
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={onCloseDrawer}
        user={user}
        navItems={navItems}
      />
    </>
  );
}

export default ResponsiveSidebar;
