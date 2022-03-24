import React from 'react';
import { Drawer, DrawerContent, FlexProps } from '@chakra-ui/react';
import Sidebar from './sidebar';
import { emptyFunction } from '../../utils/main';
import { NavItem as NavItemType } from '../../data/nav-items';
import { User } from '../../store/user.slice';

interface Props extends FlexProps {
  onClickMainMenuIcon?: () => void;
  withDrawerOptions?: boolean;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  user: User | null;
  navItems: NavItemType[];
}

function DrawerSidebar({
  onClickMainMenuIcon,
  withDrawerOptions,
  isDrawerOpen,
  onCloseDrawer,
  user,
  navItems,
}: Props) {
  return (
    <Drawer
      autoFocus={false}
      isOpen={isDrawerOpen}
      placement="left"
      onClose={onCloseDrawer}
      blockScrollOnMount={false}
      isFullHeight
      size="full"
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

DrawerSidebar.defaultProps = {
  onClickMainMenuIcon: emptyFunction,
  withDrawerOptions: false,
};

export default DrawerSidebar;
