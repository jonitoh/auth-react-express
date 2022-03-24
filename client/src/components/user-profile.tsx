import React from 'react';
import { Link, Avatar, HStack, VStack, Text, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { User } from '../store/user.slice';

type Props = {
  user: User | null;
  link?: string;
};

function UserProfile({ user, link }: Props) {
  return (
    <Link to={link || ''} as={RouterLink} _hover={{ border: 'none' }}>
      <HStack spacing={{ base: '0', md: '6' }}>
        <Avatar size="md" src={user?.imgSrc || ''} />
        <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
          <Heading as="h3" size="sm" fontSize="lg">
            {user?.username || 'Unknown username'}
          </Heading>
          <Text color="gray">{user?.roleName || 'Unknown role'}</Text>
        </VStack>
      </HStack>
    </Link>
  );
}

UserProfile.defaultProps = {
  link: '/test',
};

export default UserProfile;
