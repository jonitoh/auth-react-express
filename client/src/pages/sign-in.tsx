import React from 'react';
import { Center } from '@chakra-ui/react';
import LandingLayout from '../components/layouts/landing-layout';
import SignInForm from '../components/forms/sign-in';

export default function SignIn() {
  return (
    <LandingLayout>
      <Center m="10px">
        <SignInForm />
      </Center>
    </LandingLayout>
  );
}
