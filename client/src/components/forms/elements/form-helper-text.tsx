import React, { ReactNode } from 'react';
import { Flex, FormHelperText as ChakraFormHelperText, Text } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';

type Props = {
  id: string;
  onDisplay: boolean;
  children?: ReactNode;
};

function FormHelperText({ id, onDisplay, children }: Props) {
  return (
    <ChakraFormHelperText id={id}>
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        border="1px solid black"
        borderRadius="12px"
        bg="black"
        color="white"
        display={onDisplay ? 'flex' : 'none'}
      >
        <FiInfo />
        <Text pl="4">{children}</Text>
      </Flex>
    </ChakraFormHelperText>
  );
}

FormHelperText.defaultProps = {
  children: null,
};

export default FormHelperText;
