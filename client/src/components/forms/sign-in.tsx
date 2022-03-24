import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
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
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import store, { GlobalState as State } from '../../store';
import { extractPathFromLocation } from '../../utils/router';
import Alert from './elements/alert';
import FormLabel from './elements/form-label';
import instanciateApi from '../../services/api';

// Selectors for extracting global state
const userSelector = (state: State) => state.user;
const otherSelector = (state: State) => ({
  isValidUser: state.isValidUser,
  setAccessToken: state.setAccessToken,
  setUser: state.setUser,
});

export default function SignInForm() {
  const { isValidUser, setAccessToken, setUser } = store.fromSelector(otherSelector);
  const user = store.fromSelector(userSelector);
  // navigation after sign in
  const navigate = useNavigate();
  const location = useLocation();
  const from = extractPathFromLocation(location, '/', '/sign-in');
  const api = instanciateApi();

  // references for focus on error or already signed alert
  const infoRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // info for sign-in
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const [productKey, setProductKey] = useState('');
  const [showProductKey, setShowProductKey] = useState(false);
  const handleProductKeyVisibility = () => setShowProductKey(!showProductKey);

  // manage login process
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [onCredentials, setOnCredentials] = useState(true);
  const handleUserLoginChoice = () => setOnCredentials(!onCredentials);
  function isFormInvalid(
    // eslint-disable-next-line no-shadow
    onCredentials: boolean,
    // eslint-disable-next-line no-shadow
    password: string,
    // eslint-disable-next-line no-shadow
    email: string,
    // eslint-disable-next-line no-shadow
    productKey: string
  ): boolean {
    const isOnCredentialsInvalid = onCredentials && (password === '' || email === '');
    const isProductKeyInvalid = !onCredentials && productKey === '';
    return isOnCredentialsInvalid || isProductKeyInvalid;
  }

  const clearAll = () => {
    setEmail('');

    setPassword('');
    setShowPassword(false);

    setProductKey('');
    setShowProductKey(false);

    setOnCredentials(true);
  };

  // main action
  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // if button enabled with JS hack
    const isFormInvalidAgain = isFormInvalid(onCredentials, password, email, productKey);
    if (isFormInvalidAgain) {
      setErrorMsg('Invalid Entry');
      return;
    }
    setIsLoading(true);
    console.info(`type of login: ${onCredentials ? 'credentials' : 'product key'}`);
    // if it works then send it to the backend
    let isSignedIn = false;
    try {
      const response = await api.authApi.signIn({
        email,
        password,
        productKey,
        onCredentials,
      });
      if (!response) {
        throw new Error('NO_RESPONSE');
      }
      isSignedIn = !!response?.data?.isSignedIn;
      setUser(response?.data?.user);
      setAccessToken(response?.data?.accessToken);
      console.info("Successful sign in! You'll be redirect to the home page in a few seconds.");
    } catch (e: unknown) {
      console.info('following error', e);
      let msg = 'Unknown error';
      if (e instanceof Error) {
        if (e.message === 'NO_RESPONSE') {
          msg = 'No server response';
        } else {
          msg = e.message;
        }
      } else if (axios.isAxiosError(e)) {
        if (!e.response) {
          msg = 'No server response';
        }
        if (e.response?.status === 400) {
          msg = onCredentials ? 'Missing email or password' : 'Missing product key'; // "Missing credentials";
        }
        if (e.response?.status === 401) {
          msg = 'Unauthorized';
        }
      } else {
        msg = onCredentials
          ? 'Failed sign in on email or password'
          : 'Failed sign in on product key';
      }
      console.info('msg', msg);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      clearAll();
    }
    if (isSignedIn) {
      console.info('you better move!!');
      navigate(from);
    }
  };

  // useEffects
  useEffect(() => {
    infoRef.current?.focus();
  }, []);

  /*
  useEffect(() => {
    setErrorMsg('');
  }, [email, password, productKey]);
  */

  return (
    <Flex width="full" align="center" justifyContent="center" as="section">
      <Box p={8} minW="400px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          {errorMsg && <Alert ref={errorRef} status="error" message={errorMsg} />}
          {isValidUser(user) && false && (
            <Alert ref={infoRef} status="warning">
              <Text>
                <Link as={RouterLink} to={from}>
                  Sign in as {user?.username || "hmmm...What's your name again"} ?
                </Link>
              </Text>
            </Alert>
          )}
          <Heading>Sign In to your account</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form method="POST" onSubmit={handleSignIn}>
            <Checkbox isChecked={onCredentials} onChange={handleUserLoginChoice}>
              <Text textAlign="center">Sign in with your credentials</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel htmlFor="sign-in-email" label="Email address :" withCheck={false} />
              <Input
                id="sign-in-email"
                type="text"
                autoComplete="off"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
            </FormControl>
            <FormControl isRequired isDisabled={!onCredentials}>
              <FormLabel htmlFor="sign-in-password" label="Password :" withCheck={false} />
              <InputGroup>
                <Input
                  id="sign-in-password"
                  type={showPassword ? 'text' : 'password'}
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
                    aria-label={showPassword ? 'hide password' : 'show password'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Divider mt={4} mb={2} border="2px" />
            <Checkbox isChecked={!onCredentials} onChange={handleUserLoginChoice}>
              <Text textAlign="center">Sign in with your product key</Text>
            </Checkbox>
            <FormControl isRequired isDisabled={onCredentials}>
              <FormLabel htmlFor="sign-in-product-key" label="Product Key :" withCheck={false} />
              <InputGroup>
                <Input
                  id="sign-in-product-key"
                  type={showProductKey ? 'text' : 'password'}
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
                    aria-label={showProductKey ? 'hide product key' : 'show product key'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button
              width="full"
              mt={6}
              type="submit"
              disabled={isFormInvalid(onCredentials, password, email, productKey)}
              isLoading={isLoading}
              variant="outline"
              spinner={<CircularProgress isIndeterminate size="24px" color="teal" />}
            >
              Sign In
            </Button>
          </form>
          <Flex justify="space-around">
            <Text>
              Need an Account ?
              <Link as={RouterLink} to="/register">
                Register
              </Link>
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
