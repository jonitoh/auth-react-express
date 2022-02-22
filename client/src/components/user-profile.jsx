import { Link, Avatar, HStack, VStack, Text, Heading } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function UserProfile({ user, link = "/test" }) {
  return (
    <Link to={link} as={RouterLink} _hover={{ border: "none" }}>
      <HStack spacing={{ base: "0", md: "6" }}>
        <Avatar size="md" src={user.imgSrc} />
        <VStack
          display={{ base: "none", md: "flex" }}
          alignItems="flex-start"
          spacing="1px"
          ml="2"
        >
          <Heading as="h3" size="sm" fontSize="lg">
            {user.username}
          </Heading>
          <Text color="gray">{user.roleName}</Text>
        </VStack>
      </HStack>
    </Link>
  );
}
