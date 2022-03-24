import React from 'react';
import { FlexProps } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import BasicNavItem from './basic-nav-item';
import LinkedNavItem from './linked-nav-item';

interface Props extends FlexProps {
  icon: IconType;
  title: string;
  active: boolean;
  link: string | undefined;
  isSizeSmall: boolean;
  onClick: undefined | (() => void);
  withLink?: boolean;
}

export default function NavItem({
  icon,
  title,
  active,
  link,
  isSizeSmall,
  onClick,
  withLink,
  ...rest
}: Props) {
  if (withLink && link && onClick) {
    return (
      <LinkedNavItem
        {...{
          icon,
          title,
          active,
          link,
          isSizeSmall,
          onClick,
          ...rest,
        }}
      />
    );
  }
  return (
    <BasicNavItem
      {...{
        icon,
        title,
        active,
        isSizeSmall,
        ...rest,
      }}
    />
  );
}

NavItem.defaultProps = {
  withLink: true,
};
