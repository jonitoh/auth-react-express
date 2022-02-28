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
import { useStore } from "store";

export default function ProfileNavItem({
  isSizeSmall,
  src,
  roleName,
  label,
  link,
  showIcon = true,
  withClick = true,
}) {
  const { removeUser } = useStore();
  const toast = useToast();
  const toastId = link;
  const navigate = useNavigate();
  const api = instanciateApi();

  const onSignOut = async () => {
    let isSignedOut = false;
    let errorMsg = "";
    try {
      const response = await api.authApi.signOut();
      console.log("response", response);
      console.log("should sign out");
      isSignedOut = response.data.isSignedOut;
      console.log("isSignedOut", isSignedOut);
      removeUser();
    } catch (error) {
      console.log("fuck it", error);
      errorMsg = error.message;
    }
    if (isSignedOut) {
      setTimeout(() => {
        navigate(link, { replace: true });
      }, 3000);
    }
    if (errorMsg && !toast.isActive(toastId)) {
      // create toast
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
    // open a dialog to explain th sign out bug
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
