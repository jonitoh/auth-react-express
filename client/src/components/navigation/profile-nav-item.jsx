import React from "react";
import {
  Flex,
  Text,
  Avatar,
  Heading,
  IconButton,
  Link,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import instanciateApi from "services/api";
import store from "store";

// Selector for extracting global state
const userSelector = (state) => state.removeUser;

export default function ProfileNavItem({
  isSizeSmall,
  src,
  roleName,
  label,
  link,
  showIcon = true,
  withClick = true,
}) {
  const removeUser = store.fromSelector(userSelector);

  const toast = useToast();
  const toastId = link;
  const navigate = useNavigate();
  const api = instanciateApi();

  const onSignOut = async () => {
    let isSignedOut = false;
    let errorMsg = "";
    try {
      const response = await api.authApi.signOut();
      isSignedOut = !!response?.data?.isSignedOut;
      removeUser();
    } catch (error) {
      errorMsg = error.message;
    }
    if (isSignedOut) {
      navigate(link);
    }

    if (errorMsg && !toast.isActive(toastId)) {
      // create toast to explain the sign-out bug
      toast({
        id: toastId,
        title: "Error in sign out.",
        description: errorMsg,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
    }
  };
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
          onClick={withClick && onSignOut}
        >
          {!withClick && <Link to={link} as={RouterLink} />}
        </IconButton>
      )}
    </Flex>
  );
}
