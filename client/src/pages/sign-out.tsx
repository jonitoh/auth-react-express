import React from 'react';
import { Center } from '@chakra-ui/react';
import LandingLayout from '../components/layouts/landing-layout';

export default function SignOut() {
  return (
    <LandingLayout>
      <Center m="10px">You signed out ! </Center>
    </LandingLayout>
  );
}
