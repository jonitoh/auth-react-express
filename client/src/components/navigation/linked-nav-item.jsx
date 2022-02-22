import React from "react";
import { Flex, Text, Icon, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function LinkedNavItem({
  icon,
  title,
  active,
  link,
  isSizeSmall,
  onClick,
  ...rest
}) {
  return (
    <Flex
      mt={30}
      flexDir="column"
      w="100%"
      alignItems={isSizeSmall ? "center" : "flex-start"}
      {...rest}
    >
      <Link
        as={RouterLink}
        to={link}
        backgroundColor={active && "#AEC8CA"}
        p={3}
        borderRadius={8}
        _hover={{ textDecor: "none", backgroundColor: "#AEC8CA" }}
        w={!isSizeSmall && "100%"}
        onClick={onClick}
      >
        <Flex>
          <Icon
            as={icon}
            fontSize="xl"
            color={active ? "#82AAAD" : "gray.500"}
          />
          <Text ml={5} display={isSizeSmall ? "none" : "flex"}>
            {title}
          </Text>
        </Flex>
      </Link>
    </Flex>
  );
}
