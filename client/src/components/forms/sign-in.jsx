import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Flex,
  Box,
  Link,
  Heading,
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  CircularProgress,
  IconButton,
  Text,
  Divider,
  Checkbox,
} from "@chakra-ui/react";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, FormLabel } from "./elements";
import api from "../../services/api";
import { useStore } from "store";

export default function SignInForm() {
  const { setUser } = useStore();
  // navigation after sign in
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // references for focus on error
  const errorRef = useRef();

  // info for sign-in
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const [productKey, setProductKey] = useState("");
  const [showProductKey, setShowProductKey] = useState(false);
  const handleProductKeyVisibility = () => setShowProductKey(!showProductKey);

  // manage login process
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [onCredentials, setOnCredentials] = useState(true);
  const handleUserLoginChoice = () => setOnCredentials(!onCredentials);
  const isFormInvalid = (onCredentials, password, email, productKey) => {
    const isOnCredentialsInvalid =
      onCredentials && (password === "" || email === "");
    const isProductKeyInvalid = !onCredentials && productKey === "";
    return isOnCredentialsInvalid || isProductKeyInvalid;
  };

  const clearAll = () => {
    setEmail("");

    setPassword("");
    setShowPassword(false);

    setProductKey("");
    setShowProductKey(false);

    setOnCredentials(true);
  };

  // main action
  const handleSignIn = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const isFormInvalidAgain = isFormInvalid(
      onCredentials,
      password,
      email,
      productKey
    );
    if (isFormInvalidAgain) {
      setErrorMsg("Invalid Entry");
      return;
    }
    setIsLoading(true);
    console.log(
      `type of login: ${onCredentials ? "credentials" : "product key"}`
    );
    // if it works then send it to the backend
    let isSignedIn = false;
    try {
      const response = await api.authApi.signIn({
        email,
        password,
        productKey,
        onCredentials,
      });
      isSignedIn = !!response?.data?.isSignedIn;
      setUser(response?.data?.user);
      console.log(
        "Successful sign in! You'll be redirect to the home page in a few seconds."
      );
    } catch (error) {
      console.log("following error", error);
      let msg = onCredentials
        ? "Failed sign in on email or password"
        : "Failed sign in on product key"; //"Unknown error";

      if (!error?.response) {
        msg = "No server response";
      }
      if (error.response?.status === 400) {
        msg = onCredentials
          ? "Missing email or password"
          : "Missing product key"; //"Missing credentials";
      }
      if (error.response?.status === 401) {
        msg = "Unauthorized";
      }

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      clearAll();
    }

    if (isSignedIn) {
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 3000);
    }
  };

  // useEffects
  useEffect(() => {
    setErrorMsg("");
  }, [email, password, productKey]);

  return (
    <Flex width="full" align="center" justifyContent="center" as="section">
      <Box p={8} minW="400px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          {errorMsg && (
            <Alert ref={errorRef} status="error" message={errorMsg} />
          )}
          <Heading>Sign In to your account</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form method="POST" onSubmit={handleSignIn}>
            <Checkbox
              isChecked={onCredentials}
              onChange={handleUserLoginChoice}
            >
              <Text textAlign="center">Sign in with your credentials</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel
                htmlFor="sign-in-email"
                label="Email address :"
                withCheck={false}
              />
              <Input
                id="sign-in-email"
                type="text"
                autoComplete="off"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
            </FormControl>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel
                htmlFor="sign-in-password"
                label="Password :"
                withCheck={false}
              />
              <InputGroup>
                <Input
                  id="sign-in-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  value={password}
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
            </FormControl>
            <Divider mt={4} mb={2} border="2px" />
            <Checkbox
              isChecked={!onCredentials}
              onChange={handleUserLoginChoice}
            >
              <Text textAlign="center">Sign in with your product key</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={onCredentials}>
              <FormLabel
                htmlFor="sign-in-product-key"
                label="Product Key :"
                withCheck={false}
              />
              <InputGroup>
                <Input
                  id="sign-in-product-key"
                  type={showProductKey ? "text" : "password"}
                  autoComplete="off"
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
            </FormControl>
            <Button
              width="full"
              mt={6}
              type="submit"
              disabled={isFormInvalid(
                onCredentials,
                password,
                email,
                productKey
              )}
              isLoading={isLoading}
              variant="outline"
              spinner={
                <CircularProgress isIndeterminate size="24px" color="teal" />
              }
            >
              Sign In
            </Button>
          </form>
          <Flex justify="space-around">
            <Text>
              Need an Account ?
              <Link as={RouterLink} to="/register">
                Sign In
              </Link>
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
