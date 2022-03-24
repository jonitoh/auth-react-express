import React from 'react';
import { Center } from '@chakra-ui/react';
import MainLayout from '../components/layouts/main-layout';
import ThemeColorPicker from '../components/theme-color-picker';

export default function ThemePicker() {
  return (
    <MainLayout showNotification>
      <Center m="10px">
        <ThemeColorPicker />
      </Center>
    </MainLayout>
  );
}
