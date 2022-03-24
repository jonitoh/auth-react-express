import React from 'react';
import { Center } from '@chakra-ui/react';
import LandingLayout from '../components/layouts/landing-layout';
import RegisterByAdminForm from '../components/forms/register-by-admin';

export default function RegisterByAdmin() {
  return (
    <LandingLayout>
      <Center m="10px">
        <RegisterByAdminForm />
      </Center>
    </LandingLayout>
  );
}
