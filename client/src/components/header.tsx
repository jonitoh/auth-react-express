import React, { ReactNode } from 'react';
import { IconButton, Flex, FlexProps } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { BsFillEmojiSunglassesFill } from 'react-icons/bs';
import Logo from './logo';

interface Props extends FlexProps {
  onOpenDrawer: () => void;
  isSticky?: boolean;
  label?: string;
  children?: ReactNode;
}

function Header({ onOpenDrawer, isSticky, label, children, ...rest }: Props) {
  return (
    <Flex
      as="nav"
      flexBasis="10%"
      flexGrow="0"
      px="8"
      py="2"
      position={isSticky ? 'sticky' : 'static'}
      zIndex="1"
      alignItems="center"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpenDrawer}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Logo
        showLabel
        label={label}
        icon={<BsFillEmojiSunglassesFill />}
        onClick={() => null}
        asWrapper={Flex}
        display={{ base: 'flex', md: 'none' }}
        // align="center"
      />
      <Flex alignItems="center">{children}</Flex>
    </Flex>
  );
}

Header.defaultProps = {
  isSticky: true,
  label: 'Logo',
  children: null,
};

export default Header;
