import React, { Fragment, ReactNode, Key, ReactElement, FC } from 'react';
import { IconButton, Box, BoxProps, Heading } from '@chakra-ui/react';
import { emptyFunction } from '../utils/main';

interface Props extends BoxProps {
  showLabel?: Boolean;
  label?: String;
  icon: ReactElement;
  onClickLogo?: () => void;
  withWrapper?: boolean;
  asWrapper?: FC;
  key?: Key;
  children?: ReactNode;
}

function Logo({
  showLabel,
  label,
  icon,
  onClickLogo,
  withWrapper,
  asWrapper,
  key,
  children,
  ...rest
}: Props) {
  const Component = withWrapper || asWrapper ? asWrapper || Box : Fragment;
  const props = withWrapper || asWrapper ? { ...rest, key, children } : { key, children };
  return (
    <Component {...props}>
      <IconButton
        background="none"
        _hover={{ background: 'none' }}
        icon={icon}
        onClick={onClickLogo}
        aria-label="logo"
      />
      {showLabel && (
        <Heading as="h3" fontSize="lg">
          {label}
        </Heading>
      )}
    </Component>
  );
}

Logo.defaultProps = {
  showLabel: true,
  label: 'Logo',
  onClickLogo: emptyFunction,
  withWrapper: false,
  asWrapper: undefined,
  children: null,
  key: undefined,
};

export default Logo;
