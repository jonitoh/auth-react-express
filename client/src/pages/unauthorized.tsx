import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Heading } from '@chakra-ui/react';
import LandingLayout from '../components/layouts/landing-layout';

export default function Unauthorized() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  return (
    <LandingLayout>
      <Center m="10px">
        <Heading>You are not authorized</Heading>
        <Button onClick={goBack}>Go Back</Button>{' '}
      </Center>
    </LandingLayout>
  );
}
