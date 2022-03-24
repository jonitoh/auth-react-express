import React, { ReactNode } from 'react';
import { Flex, Center } from '@chakra-ui/react';

type Props = {
  children: ReactNode;
};

export default function LandingLayout({ children }: Props) {
  return (
    <Flex bg="palette.primary-4" flexDirection="row" h="100%" overflow="scroll">
      <Center m="5rem">{children}</Center>
    </Flex>
  );
}
