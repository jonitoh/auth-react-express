/*
Only two possible size: small or large aka not small
*/
import React, { Fragment, useEffect, useState } from "react";
import { Flex, IconButton, Divider, Heading } from "@chakra-ui/react";
import { FiX, FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import { BsFillEmojiSunglassesFill } from "react-icons/bs";
import NavItem from "../navigation/nav-item";
import NavDropdown from "../navigation/nav-dropdown";
import ProfileNavItem from "../navigation/profile-nav-item";
import Logo from "../logo";
import { useStore } from "store";

const MainMenuIcon = ({
  isSizeSmall,
  label = "Logo",
  onClickLogo = () => null,
  onClickArrow = () => null,
}) => {
  const Wrapper = (props) =>
    isSizeSmall ? (
      <Fragment {...{ key: props.key, children: props.children }} />
    ) : (
      <Flex
        direction="row"
        justify="space-between"
        w="100%"
        align="center"
        {...props}
      />
    );
  return (
    <Wrapper>
      <Logo
        showLabel={!isSizeSmall}
        label={label}
        icon={<BsFillEmojiSunglassesFill />}
        onClick={onClickLogo}
      />
      <IconButton
        zIndex="3"
        position={isSizeSmall ? "absolute" : "relative"}
        right={isSizeSmall ? "-30%" : "-10%"}
        borderRadius="50%"
        icon={isSizeSmall ? <FiChevronsRight /> : <FiChevronsLeft />}
        onClick={onClickArrow}
      />
    </Wrapper>
  );
};

const DrawerMainMenuIcon = ({
  mustBeClosed,
  onCloseDrawer,
  label = "Logo",
}) => {
  useEffect(() => {
    if (mustBeClosed) {
      onCloseDrawer();
    }
  }, [mustBeClosed, onCloseDrawer]);
  return (
    <Flex
      direction="row"
      justify="space-between"
      w="100%"
      align="center"
      mt={5}
    >
      <Heading as="h3" fontSize="lg">
        {label}
      </Heading>
      <IconButton
        background="none"
        _hover={{ background: "none" }}
        icon={<FiX />}
        onClick={onCloseDrawer}
      />
    </Flex>
  );
};

export default function Sidebar({
  onClickMainMenuIcon = () => null,
  withDrawerOptions = false,
  isDrawerOpen,
  onCloseDrawer,
  user,
  navItems,
  ...rest
}) {
  const [isSizeSmall, setSize] = useState(false);
  const { setSection, isSectionActive } = useStore();

  const clickMainMenuIcon = () => {
    onClickMainMenuIcon();
    if (!withDrawerOptions) {
      setSize(!isSizeSmall);
    }
  };

  const clickOnLogo = () =>
    console.log(
      "you clicked on the logo but nothing was implemented yet except that message"
    );

  const renderItems = (item) => {
    switch (item.type) {
      case "item": {
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
      case "list": {
        const { id, icon, title, description, link, items } = item;
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
              link,
              items,
            }}
          />
        );
      }
      default:
        throw new Error("Unknow type. Unable to continue.");
    }
  };

  const InnerWrapper = ({ children, ...rest }) => (
    <Flex
      py="4"
      flexDir="column"
      w="100%"
      alignItems={isSizeSmall ? "center" : "flex-start"}
      {...rest}
    >
      {children}
    </Flex>
  );

  return (
    <Flex // wrapper
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      w={isSizeSmall ? "75px" : "max(250px, 20%)"}
      flexDir="column"
      justifyContent="space-around"
      p=".5vh"
      {...rest}
    >
      <InnerWrapper // brand section
        position="relative"
        as="header"
      >
        {isDrawerOpen ? (
          <DrawerMainMenuIcon
            mustBeClosed={isSizeSmall || !isDrawerOpen}
            isSizeSmall={isSizeSmall}
            isDrawerOpen={isDrawerOpen}
            onCloseDrawer={onCloseDrawer}
            label="Logo"
            onClickLogo={clickOnLogo}
          />
        ) : (
          <MainMenuIcon
            isSizeSmall={isSizeSmall}
            label="Logo"
            onClickLogo={clickOnLogo}
            onClickArrow={clickMainMenuIcon}
          />
        )}
        <Divider display={isSizeSmall ? "none" : "flex"} />
      </InnerWrapper>

      <InnerWrapper // Nav items
        as="nav"
      >
        {navItems.map((item) => renderItems(item))}
      </InnerWrapper>

      <InnerWrapper // Profile item
      >
        <Divider display={isSizeSmall ? "none" : "flex"} />
        <ProfileNavItem
          isSizeSmall={isSizeSmall}
          src={user.imgSrc}
          roleName={user.roleName}
          label={user.username}
          link="/sign-out"
        />
      </InnerWrapper>
    </Flex>
  );
}
