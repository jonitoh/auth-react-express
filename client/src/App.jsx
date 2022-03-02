import React, { useEffect } from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import store from "store";
import RequireAuth from "components/require-auth";
import SignIn from "pages/sign-in";
import SignOut from "pages/sign-out";
import Register from "pages/register";
import RegisterByAdmin from "pages/register-by-admin";
import Unauthorized from "pages/unauthorized";
import Home from "pages/home";
import StatsPage from "pages/stats";
import Settings from "pages/settings";
import Missing from "pages/missing";
import Couleur from "pages/couleurs";
import Test from "pages/test";
import { ROLES } from "utils/roles";
/////////

console.log("store", store.use.persist);
////////

// Selectors for extracting global state
const themeSelector = (state) => ({
  theme: state.theme,
  getChakraTheme: state.getChakraTheme,
});
const userSelector = (state) => state.user;

export default function App() {
  const { theme: themeName, getChakraTheme } =
    store.fromSelector(themeSelector);
  const user = store.fromSelector(userSelector);
  const accessToken = store.fromSelector((state) => state.accessToken);
  const setAccessToken = store.fromSelector((state) => state.setAccessToken);

  const theme = getChakraTheme(themeName);

  useEffect(() => {
    console.log("initiate the app");
    const hydrated = store.use.getState()._hasHydrated;
    console.log("hydrated?", hydrated);
    const name = "auth__local-storage";
    let u = JSON.parse(localStorage.getItem(name));
    console.log("u", u.state);
    if (accessToken === "") {
      setAccessToken(u.state.accessToken);
    }
    store.initiate();

    console.log("user?", user);
    console.log("accessToken?", accessToken);
    console.log("themename?", themeName);

    return () => {
      console.log("clear the app");
      //store.clear();
    };
  }, []);

  console.log("acc", accessToken);

  return (
    <ChakraProvider theme={theme} resetCSS={true}>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route exact path="/sign-in" element={<SignIn />} />
          <Route exact path="/sign-out" element={<SignOut />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/unauthorized" element={<Unauthorized />} />

          {/* protected routes */}
          <Route element={<RequireAuth user={user} />}>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/stats" element={<StatsPage />} />
            <Route exact path="/settings" element={<Settings />} />
          </Route>
          <Route
            element={<RequireAuth user={user} allowedRoles={[ROLES.ADMIN]} />}
          >
            <Route
              exact
              path="/register-by-admin"
              element={<RegisterByAdmin />}
            />
          </Route>
          {/* test-driven routes */}
          <Route
            element={
              <RequireAuth
                user={user}
                allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}
              />
            }
          >
            <Route exact path="/couleur" element={<Couleur />} />
            <Route exact path="/test" element={<Test />} />
          </Route>

          {/* catch all route */}
          <Route path="*" element={<Missing />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
