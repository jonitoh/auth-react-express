import React from "react";
import {
  Flex,
  Box,
  FormLabel as ChakraFormLabel,
  FormHelperText as ChakraFormHelperText,
  Text,
  Alert as ChakraAlert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { FiInfo, FiCheck, FiX } from "react-icons/fi";

const Alert = ({ myRef, status, message, children }) => (
  <Box ref={myRef} my={4} aria-live="assertive">
    <ChakraAlert status={status} borderRadius={4}>
      <AlertIcon />
      <AlertDescription>{message || children}</AlertDescription>
    </ChakraAlert>
  </Box>
);

const FormLabel = ({
  withCheck = true,
  htmlFor,
  label,
  onCheckCondition,
  onUncheckCondition,
}) => (
  <Flex justify="space-between">
    <ChakraFormLabel htmlFor={htmlFor} display="flex">
      {label}
    </ChakraFormLabel>
    {withCheck && onCheckCondition && <FiCheck color="green" />}
    {withCheck && onUncheckCondition && <FiX color="red" />}
  </Flex>
);

const FormHelperText = ({ id, onDisplay, infoText }) => (
  <ChakraFormHelperText id={id}>
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      border="1px solid black"
      borderRadius="12px"
      bg="black"
      color="white"
      display={onDisplay ? "flex" : "none"}
    >
      <FiInfo />
      <Text pl="4">{infoText}</Text>
    </Flex>
  </ChakraFormHelperText>
);

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const validateUsername = (value) =>
  !!value ? USERNAME_REGEX.test(value) : true;
const validatePassword = (value) => PASSWORD_REGEX.test(value);
const validateMatchedPassword = (pwd, value) => pwd === value;
const validateEmail = (value) => EMAIL_REGEX.test(value);
const validateProductKey = (value) => !!value;

export {
  Alert,
  FormLabel,
  FormHelperText,
  validateUsername,
  validatePassword,
  validateMatchedPassword,
  validateEmail,
  validateProductKey,
};
