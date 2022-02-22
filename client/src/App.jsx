import React, { useEffect } from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "store";
import SignIn from "pages/sign-in";
import SignOut from "pages/sign-out";
import Register from "pages/register";
import RegisterByAdmin from "pages/register-by-admin";
import Home from "pages/home";
import StatsPage from "pages/stats";
import Settings from "pages/settings";
// below only for testing purpose
import Couleur from "pages/couleurs";
import Test from "pages/test";

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
          <Route exact path="/sign-in" element={<SignIn />} />
          <Route exact path="/sign-out" element={<SignOut />} />
          <Route exact path="/register" element={<Register />} />
          <Route
            exact
            path="/register-by-admin"
            element={<RegisterByAdmin />}
          />
          <Route exact path="/" element={<Home />} />
          <Route exact path="/stats" element={<StatsPage />} />
          <Route exact path="/settings" element={<Settings />} />
          {/* below only for testing purpose */}
          <Route exact path="/couleur" element={<Couleur />} />
          <Route exact path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
