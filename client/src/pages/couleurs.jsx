import React from "react";
import { Center } from "@chakra-ui/react";
import MainLayout from "components/layouts/main-layout";
import CouleurComponent from "components/couleurs";

export default function Couleur() {
  return (
    <MainLayout showNotification>
      <Center m="10px">
        <CouleurComponent />
      </Center>
    </MainLayout>
  );
}
