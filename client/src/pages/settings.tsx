import React from 'react';
import { Center } from '@chakra-ui/react';
import MainLayout from '../components/layouts/main-layout';

export default function Settings() {
  return (
    <MainLayout showNotification>
      <Center m="10px">This is the settings page: Welcome ! </Center>
    </MainLayout>
  );
}
