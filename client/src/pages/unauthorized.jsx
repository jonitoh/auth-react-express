import React from "react";
import { Button, Center, Heading } from "@chakra-ui/react";
import LandingLayout from "components/layouts/landing-layout";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  return (
    <LandingLayout>
      <Center m="10px">
        <Heading>You're not authorized</Heading>
        <Button onClick={goBack}>Go Back</Button>{" "}
      </Center>
    </LandingLayout>
  );
}
