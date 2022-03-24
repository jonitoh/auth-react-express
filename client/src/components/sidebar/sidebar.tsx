/*
Only two possible size: small or large aka not small
*/
import React, { useState } from 'react';
import { Flex, Divider, FlexProps } from '@chakra-ui/react';
import NavItem from '../navigation/nav-item';
import NavDropdown from '../navigation/nav-dropdown';
import ProfileNavItem from '../navigation/profile-nav-item';
import store, { GlobalState as State } from '../../store';
import { emptyFunction } from '../../utils/main';
import { NavItem as NavItemType } from '../../data/nav-items';
import { User } from '../../store/user.slice';
import { InnerWrapper } from './wrapper';
import DrawerMainMenuIcon from './drawer-main-menu-icon';
import MainMenuIcon from './main-menu-icon';

// Selectors for extracting global state
const setSectionSelector = (state: State) => state.setSection;
const isSectionActiveSelector = (state: State) => state.isSectionActive;

interface Props extends FlexProps {
  onClickMainMenuIcon?: () => void;
  withDrawerOptions?: boolean;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  user: User | null;
  navItems: NavItemType[];
}

function Sidebar({
  onClickMainMenuIcon,
  withDrawerOptions,
  isDrawerOpen,
  onCloseDrawer,
  user,
  navItems,
  ...rest
}: Props) {
  const setSection = store.fromSelector(setSectionSelector);
  const isSectionActive = store.fromSelector(isSectionActiveSelector);

  const [isSizeSmall, setSize] = useState(false);

  const clickMainMenuIcon = () => {
    if (onClickMainMenuIcon) {
      onClickMainMenuIcon();
    }
    if (!withDrawerOptions) {
      setSize(!isSizeSmall);
    }
  };

  const clickOnLogo = () =>
    console.warn('you clicked on the logo but nothing was implemented yet except that message');

  function renderItems(item: NavItemType) {
    switch (item.type) {
      case 'item': {
        const { id, icon, title, description, link } = item;
        return (
          <NavItem
            {...{
              key: id,
              isSizeSmall,
              icon,
              title,
              description,
              active: isSectionActive(id),
              onClick: () => setSection(id),
              link,
            }}
          />
        );
      }
      case 'list': {
        const { id, icon, title, description, items } = item;
        return (
          <NavDropdown
            {...{
              key: id,
              isSizeSmall,
              icon,
              title,
              description,
              activeFunctionByKey: isSectionActive,
              onClickFunctionByKey: setSection,
              items,
            }}
          />
        );
      }
      default:
        throw new Error('Unknow type. Unable to continue.');
    }
  }

  const Wrapper = React.useCallback((props) => InnerWrapper(props, isSizeSmall), [isSizeSmall]);

  return (
    <Flex // wrapper
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      w={isSizeSmall ? '75px' : 'max(250px, 20%)'}
      flexDir="column"
      justifyContent="space-around"
      p=".5vh"
      {...rest}
    >
      <Wrapper // brand section
        position="relative"
        as="header"
      >
        {isDrawerOpen ? (
          <DrawerMainMenuIcon
            mustBeClosed={isSizeSmall || !isDrawerOpen}
            onCloseDrawer={onCloseDrawer}
            label="Logo"
          />
        ) : (
          <MainMenuIcon
            isSizeSmall={isSizeSmall}
            label="Logo"
            onClickLogo={clickOnLogo}
            onClickArrow={clickMainMenuIcon}
          />
        )}
        <Divider display={isSizeSmall ? 'none' : 'flex'} />
      </Wrapper>

      <Wrapper // Nav items
        as="nav"
      >
        {navItems.map((item) => renderItems(item))}
      </Wrapper>

      <Wrapper // Profile item
      >
        <Divider display={isSizeSmall ? 'none' : 'flex'} />
        <ProfileNavItem
          isSizeSmall={isSizeSmall}
          src={user?.imgSrc || ''}
          roleName={user?.roleName || 'Unknown role'}
          label={user?.username || 'Unknown username'}
          link="/sign-out"
        />
      </Wrapper>
    </Flex>
  );
}

Sidebar.defaultProps = {
  onClickMainMenuIcon: emptyFunction,
  withDrawerOptions: false,
};

export default Sidebar;
