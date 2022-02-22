import React from "react";
import {
  Flex,
  Text,
  Avatar,
  Heading,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function ProfileNavItem({
  isSizeSmall,
  src,
  roleName,
  label,
  link = "/test",
  showIcon = true,
}) {
  return (
    <Flex mt={4} align="center">
      {!isSizeSmall && <Avatar size="sm" src={src} />}
      <Flex flexDir="column" ml={4} display={isSizeSmall ? "none" : "flex"}>
        <Heading as="h3" size="sm">
          {label}
        </Heading>
        <Text color="gray">{roleName}</Text>
      </Flex>
      {showIcon && (
        <IconButton
          ml="2"
          aria-label="Sign Out"
          variant="ghost"
          icon={<FiLogOut />}
        >
          <Link to={link} as={RouterLink} />
        </IconButton>
      )}
    </Flex>
  );
}
