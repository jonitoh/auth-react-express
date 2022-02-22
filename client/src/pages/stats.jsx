import React from "react";
import { Center } from "@chakra-ui/react";
import MainLayout from "components/layouts/main-layout";

export default function Stats() {
  return (
    <MainLayout showNotification>
      <Center m="10px">This is the stats page: Welcome ! </Center>
    </MainLayout>
  );
}
