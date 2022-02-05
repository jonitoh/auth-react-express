import React from "react";
import { Flex } from "@chakra-ui/react";
import Navbar from "./navbar";

const Layout = ({ children, ...props }) => {
  return (
    <Flex
      direction="column"
      align="center"
      maxW={{ xl: "1200px" }}
      m="0 auto"
      {...props}
    >
      <Navbar />
      {children}
    </Flex>
  );
};

export default Layout;
