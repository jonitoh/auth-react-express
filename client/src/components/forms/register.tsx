import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import store, { GlobalState as State } from '../../store';
import { extractPathFromLocation } from '../../utils/router';
import Alert from './elements/alert';
import FormLabel from './elements/form-label';
import FormHelperText from './elements/form-helper-text';
import {
  validateUsername,
  validatePassword,
  validateMatchedPassword,
  validateEmail,
  validateProductKey,
} from './elements/validator';
import instanciateApi from '../../services/api';

// Selector for extracting global state
const selector = (state: State) => ({
  setUser: state.setUser,
  setAccessToken: state.setAccessToken,
});

export default function RegisterForm() {
  // navigation after sign in
  const navigate = useNavigate();
  const location = useLocation();
  const from = extractPathFromLocation(location, '/', ['/register', '/sign-up']);
  const api = instanciateApi();

  const { setUser, setAccessToken } = store.fromSelector(selector);
  // references for focus on user input and error
  const registerRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // info for register
  const [username, setUsername] = useState('');
  const [validUsername, setValidUsername] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const [matchedPassword, setMatchedPassword] = useState('');
  const [validMatchedPassword, setValidMatchedPassword] = useState(false);
  const [matchedPasswordFocus, setMatchedPasswordFocus] = useState(false);
  const [showMatchedPassword, setShowMatchedPassword] = useState(false);
  const handleMatchedPasswordVisibility = () => setShowMatchedPassword(!showMatchedPassword);

  const [productKey, setProductKey] = useState('');
  const [validProductKey, setValidProductKey] = useState(false);
  const [productKeyFocus, setProductKeyFocus] = useState(false);
  const [showProductKey, setShowProductKey] = useState(false);
  const handleProductKeyVisibility = () => setShowProductKey(!showProductKey);

  // manage login process
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isFormInvalid =
    !validUsername || !validEmail || !validPassword || !validMatchedPassword || !validProductKey;
  const clearAll = () => {
    setUsername('');
    setValidUsername(false);
    setUsernameFocus(false);

    setEmail('');
    setValidEmail(false);
    setEmailFocus(false);

    setPassword('');
    setValidPassword(false);
    setPasswordFocus(false);
    setShowPassword(false);

    setMatchedPassword('');
    setValidMatchedPassword(false);
    setMatchedPasswordFocus(false);
    setShowMatchedPassword(false);

    setProductKey('');
    setValidProductKey(false);
    setProductKeyFocus(false);
    setShowProductKey(false);
  };

  // main action
  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // if button enabled with JS hack
    const isFormValidAgain =
      !validateUsername(username) ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      !validateMatchedPassword(password, matchedPassword) ||
      !validateProductKey(productKey);
    if (!isFormValidAgain) {
      setErrorMsg('Invalid Entry');
      return;
    }
    setIsLoading(true);
    // if it works then send it to the backend
    let isRegistered = false;
    try {
      const response = await api.authApi.register({
        email,
        username,
        password,
        productKey,
      });
      if (!response) {
        throw new Error('NO_RESPONSE');
      }
      isRegistered = response?.data?.isRegistered;
      setUser(response?.data?.user);
      setAccessToken(response?.data?.accessToken);
      console.info(
        "Successful registration! You'll be redirect to the home page in a few seconds."
      );
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
          msg = 'Missing credentials';
        }
        if (e.response?.status === 401) {
          msg = 'Unauthorized';
        }
      } else {
        msg = 'Something went wrong!';
      }
      console.info('msg', msg);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      clearAll();
    }

    if (isRegistered) {
      navigate(from, { replace: true });
    }
  };

  // useEffects
  useEffect(() => {
    registerRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidUsername(validateUsername(username));
  }, [username]);

  useEffect(() => {
    setValidEmail(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(validatePassword(password));
    setValidMatchedPassword(validateMatchedPassword(password, matchedPassword));
  }, [password, matchedPassword]);

  useEffect(() => {
    setValidProductKey(validateProductKey(productKey));
  }, [productKey]);

  /*
  useEffect(() => {
    setErrorMsg('');
  }, [username, email, password, matchedPassword, productKey]);
  */

  return (
    <Flex width="full" align="center" justifyContent="center" as="section">
      <Box p={8} minW="400px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          {errorMsg && <Alert ref={errorRef} status="error" message={errorMsg} />}
          <Heading>Register</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form method="POST" onSubmit={handleRegister}>
            <FormControl>
              <FormLabel
                htmlFor="register-username"
                label="Username :"
                onCheckCondition={validUsername && !!username}
                onUncheckCondition={!validUsername && !!username}
              />
              <Input
                id="register-username"
                type="text"
                ref={registerRef}
                autoComplete="off"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
                aria-invalid={validUsername ? 'false' : 'true'}
                aria-describedby="register-username-note"
                onFocus={() => setUsernameFocus(true)}
                onBlur={() => setUsernameFocus(false)}
              />
              <FormHelperText
                id="register-username-note"
                onDisplay={usernameFocus && !!username && !validUsername}
              >
                <>
                  4 to 24 characters.
                  <br />
                  Must begin with a letter.
                  <br />
                  Letters, numbers, underscores, hyphens allowed.
                </>
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                htmlFor="register-email"
                label="Email address :"
                onCheckCondition={validEmail && !!email}
                onUncheckCondition={!validEmail && !!email}
              />
              <Input
                id="register-email"
                type="text"
                autoComplete="off"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                aria-invalid={validEmail ? 'false' : 'true'}
                aria-describedby="register-email-note"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
              <FormHelperText
                id="register-email-note"
                onDisplay={emailFocus && !!email && !validEmail}
              >
                Email like *******@****.*****
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                htmlFor="register-password"
                label="Password :"
                onCheckCondition={validPassword && !!password}
                onUncheckCondition={!validPassword && !!password}
              />
              <InputGroup>
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  aria-invalid={validPassword ? 'false' : 'true'}
                  aria-describedby="register-password-note"
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
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
              <FormHelperText
                id="register-password-note"
                onDisplay={passwordFocus && !!password && !validPassword}
              >
                <>
                  8 to 24 characters.
                  <br />
                  Must include uppercase and lowercase letters, a number and a special character.
                  <br />
                  Allowed special characters: <span aria-label="exclamation mark">!</span>{' '}
                  <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span>{' '}
                  <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                </>
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                htmlFor="register-matched-password"
                label="Confirm Password :"
                onCheckCondition={validMatchedPassword && !!matchedPassword}
                onUncheckCondition={!validMatchedPassword && !!matchedPassword}
              />
              <InputGroup>
                <Input
                  id="register-matched-password"
                  type={showMatchedPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={matchedPassword}
                  onChange={({ target }) => setMatchedPassword(target.value)}
                  aria-invalid={validMatchedPassword ? 'false' : 'true'}
                  aria-describedby="register-matched-password-note"
                  onFocus={() => setMatchedPasswordFocus(true)}
                  onBlur={() => setMatchedPasswordFocus(false)}
                />
                <InputRightElement width="3rem">
                  <IconButton
                    h="1.5rem"
                    size="sm"
                    onClick={handleMatchedPasswordVisibility}
                    icon={showMatchedPassword ? <ViewOffIcon /> : <ViewIcon />}
                    aria-label={showMatchedPassword ? 'hide password' : 'show password'}
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText
                id="register-matched-password-note"
                onDisplay={matchedPasswordFocus && !!matchedPassword && !validMatchedPassword}
              >
                Write the same password as before
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                htmlFor="register-product-key"
                label="Product Key :"
                onCheckCondition={validProductKey && !!productKey}
                onUncheckCondition={!validProductKey && !!productKey}
              />
              <InputGroup>
                <Input
                  id="register-product-key"
                  type={showProductKey ? 'text' : 'password'}
                  autoComplete="off"
                  value={productKey}
                  onChange={({ target }) => setProductKey(target.value)}
                  aria-invalid={validProductKey ? 'false' : 'true'}
                  aria-describedby="register-product-key-note"
                  onFocus={() => setProductKeyFocus(true)}
                  onBlur={() => setProductKeyFocus(false)}
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
              <FormHelperText
                id="register-product-key-note"
                onDisplay={productKeyFocus && !!productKey && !validProductKey}
              >
                Write the product key you received
              </FormHelperText>
            </FormControl>
            <Button
              width="full"
              mt={6}
              type="submit"
              disabled={isFormInvalid}
              isLoading={isLoading}
              variant="outline"
              spinner={<CircularProgress isIndeterminate size="24px" color="teal" />}
            >
              Register
            </Button>
          </form>
          <Flex justify="space-around">
            <Text>
              Already registered ?
              <Link as={RouterLink} to="/sign-in">
                Sign In
              </Link>
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
