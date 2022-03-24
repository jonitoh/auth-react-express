import React from 'react';
import { IconType } from 'react-icons';
import { Flex, FlexProps, Text, Icon, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface Props extends FlexProps {
  icon: IconType;
  title: string;
  active: boolean;
  link: string;
  isSizeSmall: boolean;
  onClick: () => void;
}

export default function LinkedNavItem({
  icon,
  title,
  active,
  link,
  isSizeSmall,
  onClick,
  ...rest
}: Props) {
  return (
    <Flex
      mt={30}
      flexDir="column"
      w="100%"
      alignItems={isSizeSmall ? 'center' : 'flex-start'}
      {...rest}
    >
      <Link
        as={RouterLink}
        to={link}
        backgroundColor={active ? '#AEC8CA' : undefined}
        p={3}
        borderRadius={8}
        _hover={{ textDecor: 'none', backgroundColor: '#AEC8CA' }}
        w={!isSizeSmall ? '100%' : undefined}
        onClick={onClick}
      >
        <Flex>
          <Icon as={icon} fontSize="xl" color={active ? '#82AAAD' : 'gray.500'} />
          <Text ml={5} display={isSizeSmall ? 'none' : 'flex'}>
            {title}
          </Text>
        </Flex>
      </Link>
    </Flex>
  );
}
