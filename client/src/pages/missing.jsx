import React from "react";
import { Center } from "@chakra-ui/react";
import LandingLayout from "components/layouts/landing-layout";

export default function Missing() {
  return (
    <LandingLayout>
      <Center m="10px">Oups! Unknown link ...</Center>
    </LandingLayout>
  );
}
