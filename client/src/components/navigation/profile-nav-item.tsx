import React from 'react';
import { Flex, Text, Avatar, Heading, IconButton, Link, useToast } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import store, { GlobalState as State } from '../../store';
import instanciateApi from '../../services/api';

type Props = {
  isSizeSmall: boolean;
  src: string;
  roleName: string;
  label: string;
  link: string;
  showIcon?: boolean;
  withClick?: boolean;
};

// Selector for extracting global state
const userSelector = (state: State) => state._clearUser;

export default function ProfileNavItem({
  isSizeSmall,
  src,
  roleName,
  label,
  link,
  showIcon,
  withClick,
}: Props) {
  const removeUser = store.fromSelector(userSelector);

  const toast = useToast();
  const toastId = link;
  const navigate = useNavigate();
  const api = instanciateApi();

  const onSignOut = async () => {
    let isSignedOut = false;
    let errorMsg = '';
    try {
      const response = await api.authApi.signOut();
      isSignedOut = !!response?.data?.isSignedOut;
      removeUser();
    } catch (error: unknown) {
      errorMsg = error instanceof Error ? error.message : 'Error when signing out';
    }
    if (isSignedOut) {
      navigate(link);
    }

    if (errorMsg && !toast.isActive(toastId)) {
      // create toast to explain the sign-out bug
      toast({
        id: toastId,
        title: 'Error in sign out.',
        description: errorMsg,
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Flex mt={4} align="center">
      {!isSizeSmall && <Avatar size="sm" src={src} />}
      <Flex flexDir="column" ml={4} display={isSizeSmall ? 'none' : 'flex'}>
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
          onClick={withClick ? onSignOut : undefined}
        >
          {!withClick && <Link to={link} as={RouterLink} />}
        </IconButton>
      )}
    </Flex>
  );
}

ProfileNavItem.defaultProps = {
  showIcon: true,
  withClick: true,
};
