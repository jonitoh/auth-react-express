import React, { useEffect } from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "store";
import Login from "pages/login-page";
import Home from "pages/home-page";
import Settings from "pages/settings-page";
import Layout from "components/layout";
import SignUp from "pages/signup-page";
import Couleur from "components/couleurs";

import Test from "pages/test-page";

export default function App() {
  const { initiateTheme, getChakraTheme } = useStore();
  // COLOR THEME -- Force an initial state based on the local storage value
  useEffect(() => initiateTheme(), [initiateTheme]);
  const theme = getChakraTheme();
  // <Route exact path="/" element={<Home />} />
  //<Layout>
  return (
    <ChakraProvider theme={theme} resetCSS={true}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/couleur" element={<Couleur />} />
          <Route exact path="/test" element={<Test />} />
          <Route exact path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
