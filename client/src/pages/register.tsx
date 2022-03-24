import React from 'react';
import { Center } from '@chakra-ui/react';
import LandingLayout from '../components/layouts/landing-layout';
import RegisterForm from '../components/forms/register';

export default function Register() {
  return (
    <LandingLayout>
      <Center m="10px">
        <RegisterForm />
      </Center>
    </LandingLayout>
  );
}
