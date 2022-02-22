import React from "react";
import { Flex, Text, Icon, Box } from "@chakra-ui/react";

export default function BasicNavItem({
  icon,
  title,
  active,
  isSizeSmall,
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
      <Box
        backgroundColor={active && "#AEC8CA"}
        p={3}
        borderRadius={8}
        _hover={{ textDecor: "none", backgroundColor: "#AEC8CA" }}
        w={!isSizeSmall && "100%"}
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
      </Box>
    </Flex>
  );
}
