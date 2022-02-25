import React from "react";
import { Center } from "@chakra-ui/react";
import MainLayout from "components/layouts/main-layout";
import Users from "components/users";

export default function Stats() {
  return (
    <MainLayout showNotification>
      <Center m="10px">This is the stats page: Welcome ! </Center>
      <Users />
    </MainLayout>
  );
}
