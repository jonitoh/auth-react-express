import React from "react";
import { Center } from "@chakra-ui/react";
import MainLayout from "components/layouts/main-layout";

export default function Home() {
  return (
    <MainLayout showNotification>
      <Center m="10px">This is the homepage: Welcome ! </Center>
    </MainLayout>
  );
}
