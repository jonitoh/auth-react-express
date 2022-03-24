/*
Only two possible size: small or large aka not small
*/
import React, { Fragment, ReactNode, Key } from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';

interface SizedWrapperProps extends FlexProps {
  key?: Key;
  children?: ReactNode;
}

export function SizedWrapper(props: SizedWrapperProps, isSizeSmall: boolean) {
  const { key, children, ...rest } = props;
  // eslint-disable-next-line react/destructuring-assignment
  return isSizeSmall ? (
    // eslint-disable-next-line react/destructuring-assignment
    <Fragment key={key}> {children}</Fragment>
  ) : (
    <Flex direction="row" justify="space-between" w="100%" align="center" key={key} {...rest}>
      {children}
    </Flex>
  );
}

SizedWrapper.defaultProps = {
  key: undefined,
  children: null,
};

interface InnerWrapperProps extends FlexProps {
  children?: ReactNode;
}

export function InnerWrapper(props: InnerWrapperProps, isSizeSmall: boolean) {
  const { children, ...rest } = props;
  return (
    <Flex
      py="4"
      flexDir="column"
      w="100%"
      alignItems={isSizeSmall ? 'center' : 'flex-start'}
      {...rest}
    >
      {children}
    </Flex>
  );
}

InnerWrapper.defaultProps = {
  children: null,
};
