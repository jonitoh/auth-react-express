import React, { useState } from "react";
import {
  Flex,
  Box,
  Divider,
  Heading,
  Text,
  Link,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  CircularProgress,
  IconButton,
  //BeatLoader,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import FormMessage from "./form-message";
//import { AuthService } from "../services/api";

const LogInForm = () => {
  // login with credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  // login with product-key
  const [productKey, setProductKey] = useState("");
  const [showProductKey, setShowProductKey] = useState(false);
  const handleProductKeyVisibility = () => setShowProductKey(!showProductKey);

  // manage login process
  const [isLoading, setIsLoading] = useState(false);
  const [onCredentials, setOnCredentials] = useState(true);
  const handleUserLoginChoice = () => setOnCredentials(!onCredentials);
  const isOnCredentialsInvalid =
    onCredentials && (password === "" || email === "");
  const isProductKeyInvalid = !onCredentials && productKey === "";
  const isInvalid = isOnCredentialsInvalid || isProductKeyInvalid;
  const [errors, setErrors] = useState("");

  const handleSignIn = async (event) => {
    event.preventDefault();
    setErrors("");
    setIsLoading(true);
    console.log(
      `type of login: ${onCredentials ? "credentials" : "product key"}`
    );
    // if it works then send it to the backend
    try {
      //await AuthService.login({ email, password, productKey, onCredentials });
    } catch (error) {
      console.log("following error", error);
      setErrors(
        onCredentials ? "Invalid email or password" : "Invalid product key"
      );
    } finally {
      setIsLoading(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setProductKey("");
      setShowProductKey(false);
    }
  };

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Box textAlign="center">
          <Heading>Login to your account</Heading>
          <Text>
            <Link to="/signup" as={RouterLink}>
              or Sign Up
            </Link>
          </Text>
        </Box>
        <Box my={4} textAlign="left">
          <form method="POST" onSubmit={handleSignIn}>
            {errors && <FormMessage status="error" message={errors} />}
            <Checkbox
              isChecked={onCredentials}
              onChange={handleUserLoginChoice}
            >
              <Text textAlign="center">Sign in with your credentials</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input
                id="email"
                type="text"
                placeholder="***@****.**"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
              <FormHelperText>
                Enter the email you signed up with.
              </FormHelperText>
            </FormControl>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="*****"
                  value={password}
                  autoComplete="off"
                  onChange={({ target }) => setPassword(target.value)}
                />
                <InputRightElement width="3rem">
                  <IconButton
                    h="1.5rem"
                    size="sm"
                    onClick={handlePasswordVisibility}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText>Enter your password.</FormHelperText>
            </FormControl>
            <Divider mt={4} mb={2} border="2px" />
            <Checkbox
              isChecked={!onCredentials}
              onChange={handleUserLoginChoice}
            >
              <Text textAlign="center">Sign in with your product key</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={onCredentials}>
              <FormLabel htmlFor="product-key">Product Key</FormLabel>
              <InputGroup>
                <Input
                  type={showProductKey ? "text" : "password"}
                  placeholder="*********"
                  value={productKey}
                  onChange={({ target }) => setProductKey(target.value)}
                />
                <InputRightElement width="3rem">
                  <IconButton
                    h="1.5rem"
                    size="sm"
                    onClick={handleProductKeyVisibility}
                    icon={showProductKey ? <ViewOffIcon /> : <ViewIcon />}
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText>Enter your product key.</FormHelperText>
            </FormControl>
            <Divider mt={4} mb={2} border="2px" />
            <Button
              width="full"
              mt={4}
              type="submit"
              disabled={isInvalid}
              isLoading={isLoading}
              variant="outline"
              spinner={
                <CircularProgress isIndeterminate size="24px" color="teal" />
              }
              //spinner={<BeatLoader size={8} color="white" />}
            >
              Sign In
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};

export default LogInForm;
