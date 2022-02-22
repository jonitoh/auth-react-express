import { IconButton, Flex } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { BsFillEmojiSunglassesFill } from "react-icons/bs";
import Logo from "./logo";

export default function Header({
  onOpenDrawer,
  isSticky = true,
  label = "Logo",
  children,
  ...rest
}) {
  return (
    <Flex
      as="nav"
      flexBasis="10%"
      flexGrow="0"
      px="8"
      py="2"
      position={isSticky ? "sticky" : "static"}
      zIndex="1"
      alignItems="center"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpenDrawer}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Logo
        showLabel
        label={label}
        icon={<BsFillEmojiSunglassesFill />}
        onClick={() => null}
        asWrapper={Flex}
        display={{ base: "flex", md: "none" }}
        align="center"
      />
      <Flex alignItems="center">{children}</Flex>
    </Flex>
  );
}
