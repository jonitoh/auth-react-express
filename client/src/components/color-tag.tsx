import React from 'react';
import { Box, Text, Flex, FlexProps, Spacer } from '@chakra-ui/react';

interface Props extends FlexProps {
  text: string;
  mainColor: string;
}

function ColorTag({ text, mainColor, ...props }: Props) {
  return (
    <Flex p="1" {...props} justify="center">
      <Text p="1">{text}</Text>
      <Spacer />
      <Box w="2rem" h="2rem" p="1" borderRadius="50%" bg={mainColor} />
    </Flex>
  );
}

export default ColorTag;
