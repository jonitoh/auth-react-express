import React, { forwardRef, ReactNode } from 'react';
import { Box, Alert as ChakraAlert, AlertIcon, AlertDescription } from '@chakra-ui/react';

type Props = {
  status: 'info' | 'warning' | 'success' | 'error' | undefined;
  message?: string;
  children?: ReactNode;
};

type Ref = HTMLDivElement;

const Alert = forwardRef<Ref, Props>(function Alert({ status, message, children }, ref) {
  return (
    <Box ref={ref} my={4} aria-live="assertive">
      <ChakraAlert status={status} borderRadius={4}>
        <AlertIcon />
        <AlertDescription>{message || children}</AlertDescription>
      </ChakraAlert>
    </Box>
  );
});

Alert.defaultProps = {
  children: null,
  message: undefined,
};

export default Alert;
