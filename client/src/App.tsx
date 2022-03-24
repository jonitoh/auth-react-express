import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import store, { GlobalState as State } from './store';
import RequireAuth from './components/require-auth';
import SignIn from './pages/sign-in';
import SignOut from './pages/sign-out';
import Register from './pages/register';
import RegisterByAdmin from './pages/register-by-admin';
import Unauthorized from './pages/unauthorized';
import Home from './pages/home';
import StatsPage from './pages/stats';
import Settings from './pages/settings';
import Missing from './pages/missing';
import Couleur from './pages/theme-picker';
import Test from './pages/test';
import { ROLES } from './data/roles';

// Selectors for extracting global state
const themeSelector = (state: State) => ({
  theme: state.theme,
  getChakraTheme: state.getChakraTheme,
});
const userSelector = (state: State) => state.user;

export default function App() {
  const { theme: themeName, getChakraTheme } = store.fromSelector(themeSelector);
  const user = store.fromSelector(userSelector);

  const theme = getChakraTheme(themeName);

  useEffect(() => {
    console.info('App initialisation');
    const rehydrate = true;
    store.initiate(rehydrate);

    return () => {
      console.info('App cleansing/unsubcription');
      store.clear();
    };
  }, []);

  console.info('after initialization -- user?', user);

  return (
    <ChakraProvider theme={theme} resetCSS>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* protected routes */}
          <Route element={<RequireAuth user={user} />}>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route element={<RequireAuth user={user} allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/register-by-admin" element={<RegisterByAdmin />} />
          </Route>
          {/* test-driven routes */}
          <Route
            element={<RequireAuth user={user} allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} />}
          >
            <Route path="/couleur" element={<Couleur />} />
            <Route path="/test" element={<Test />} />
          </Route>

          {/* catch all route */}
          <Route path="*" element={<Missing />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
