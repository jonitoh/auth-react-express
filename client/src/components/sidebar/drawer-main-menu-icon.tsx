/*
Only two possible size: small or large aka not small
*/
import React, { useEffect } from 'react';
import { Flex, IconButton, Heading } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

type DrawerMainMenuIconProps = {
  mustBeClosed: boolean;
  onCloseDrawer: () => void;
  label?: string;
};

function DrawerMainMenuIcon({ mustBeClosed, onCloseDrawer, label }: DrawerMainMenuIconProps) {
  useEffect(() => {
    if (mustBeClosed) {
      onCloseDrawer();
    }
  }, [mustBeClosed, onCloseDrawer]);
  return (
    <Flex direction="row" justify="space-between" w="100%" align="center" mt={5}>
      <Heading as="h3" fontSize="lg">
        {label}
      </Heading>
      <IconButton
        background="none"
        _hover={{ background: 'none' }}
        icon={<FiX />}
        onClick={onCloseDrawer}
        aria-label="close the drawer"
      />
    </Flex>
  );
}

DrawerMainMenuIcon.defaultProps = {
  label: 'Logo',
};

export default DrawerMainMenuIcon;
