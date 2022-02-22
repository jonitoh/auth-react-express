import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Flex,
  Box,
  Divider,
  Heading,
  Button,
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
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import FormMessage from "./form-message";
//import { AuthService } from "../services/api";

const SignUpForm = () => {
  // info for signing up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);
  const [productKey, setProductKey] = useState("");
  const [showProductKey, setShowProductKey] = useState(false);
  const handleProductKeyVisibility = () => setShowProductKey(!showProductKey);

  // manage login process
  const [isLoading, setIsLoading] = useState(false);
  const isInvalid = password === "" || email === "" || productKey === "";
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    // if it works then send it to the backend
    try {
      //await AuthService.register({ email, password, productKey });
      setSuccessMsg(
        "Successful registration! You'll be redirect to the home page in afew seconds."
      );
      setIsLoading(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setProductKey("");
      setShowProductKey(false);
      setTimeout(() => {
        setIsSignIn(true);
      }, 5000);
    } catch (error) {
      console.log("following error", error);
      setErrorMsg("Something went wrong!");
      setIsLoading(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setProductKey("");
      setShowProductKey(false);
    }
  };

  if (isSignIn) return <Navigate to="/" />;
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
          <Heading>Sign Up</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form method="POST" onSubmit={handleSignIn}>
            {errorMsg && <FormMessage status="error" message={errorMsg} />}
            {successMsg && (
              <FormMessage status="success" message={successMsg} />
            )}
            <FormControl isRequired>
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
            <FormControl isRequired>
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
            <FormControl isRequired>
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

export default SignUpForm;
