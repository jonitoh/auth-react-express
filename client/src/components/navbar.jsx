import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Text, Button, Link } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";

const MenuItems = ({ children, isLast, to = "/", ...props }) => {
  return (
    <Text
      mb={{ base: isLast ? 0 : 8, sm: 0 }}
      mr={{ base: 0, sm: isLast ? 0 : 8 }}
      display="block"
      {...props}
    >
      <Link to={to} as={RouterLink}>
        {children}
      </Link>
    </Text>
  );
};

const Navbar = (props) => {
  const [show, setShow] = React.useState(false);
  const toggleMenu = () => setShow(!show);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      p={8}
      bg="cyan.500"
      color={["white", "white", "cyan.50", "cyan.50"]}
      {...props}
    >
      <Box display={{ base: "block", md: "none" }} onClick={toggleMenu}>
        {show ? <CloseIcon /> : <HamburgerIcon />}
      </Box>

      <Box
        display={{ base: show ? "block" : "none", md: "block" }}
        flexBasis={{ base: "100%", md: "auto" }}
      >
        <Flex
          align={["center", "center", "center", "center"]}
          justify={["center", "space-between", "flex-end", "flex-end"]}
          direction={["column", "row", "row", "row"]}
          pt={[4, 4, 0, 0]}
        >
          <MenuItems to="/">Home</MenuItems>
          <MenuItems to="/settings">Settings</MenuItems>
          <MenuItems to="/signup">Sign Up</MenuItems>
          <Button
            size="sm"
            rounded="md"
            color={["primary.500", "primary.500", "white", "white"]}
            bg="cyan.600"
            _hover={{
              bg: "cyan.100",
            }}
          >
            Optional button
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Navbar;
