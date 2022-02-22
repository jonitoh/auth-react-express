import React from "react";
import { Flex, Center } from "@chakra-ui/react";

export default function LandingLayout({ children }) {
  return (
    <Flex bg="palette.primary-4" flexDirection="row" h="100%" overflow="scroll">
      <Center m="5rem">{children}</Center>
    </Flex>
  );
}
