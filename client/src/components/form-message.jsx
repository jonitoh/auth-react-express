import React from "react";
import { Box, Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";

const FormMessage = ({ status, message }) => (
  <Box my={4}>
    <Alert status={status} borderRadius={4}>
      <AlertIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </Box>
);

export default FormMessage;
