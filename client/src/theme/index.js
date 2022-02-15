/*
import { extendTheme } from "@chakra-ui/react";
import { globalStyles } from "./styles";
import { font } from "./foundations/fonts";
import { breakpoints } from "./foundations/breakpoints";
import { buttonStyles } from "./components/button";
import { badgeStyles } from "./components/badge";
import { linkStyles } from "./components/link";
import { drawerStyles } from "./components/drawer";
import { CardComponent } from "./additions/card/Card";
import { CardBodyComponent } from "./additions/card/CardBody";
import { CardHeaderComponent } from "./additions/card/CardHeader";
import { MainPanelComponent } from "./additions/layout/MainPanel";
import { PanelContentComponent } from "./additions/layout/PanelContent";
import { PanelContainerComponent } from "./additions/layout/PanelContainer";
// import { mode } from "@chakra-ui/theme-tools";
export default extendTheme(
  { breakpoints }, // Breakpoints
  globalStyles,
  font, // Global styles
  buttonStyles, // Button styles
  badgeStyles, // Badge styles
  linkStyles, // Link styles
  drawerStyles, // Sidebar variant for Chakra's drawer
  CardComponent, // Card component
  CardBodyComponent, // Card Body component
  CardHeaderComponent, // Card Header component
  MainPanelComponent, // Main Panel component
  PanelContentComponent, // Panel Content component
  PanelContainerComponent // Panel Container component
);
*/
import palettes from "./palettes";
import { extendTheme } from "@chakra-ui/react";

const metaTheme = {
  colors: {
    palettes: {
      summerSplash: {
        // cf. https://www.canva.com/colors/color-palettes/summer-splash/
        "primary-1": "#05445e", // Navy blue
        "primary-2": "#189ab4", // blue grotto
        "primary-3": "#75e6da", // blue green
        "primary-4": "#d4f1f4", // baby blue
      },
      healthyLeaves: {
        // cf. https://www.canva.com/colors/color-palettes/healthy-leaves/
        "primary-1": "#3d550c", // olive green
        "primary-2": "#81b622", // lime green
        "primary-3": "#ecf87f", // yellow green
        "primary-4": "#59981a", // green
      },
      customOrange: {
        // cf. https://www.canva.com/colors/color-meanings/orange/
        "primary-1": "#FFA500",
        "primary-2": "#FFB52E",
        "primary-3": "#FFC55C",
        "primary-4": "#FFD68A",
      },
    },
  },
};

const generateThemeFromPalette = (data, metaTheme) => {
  return extendTheme({
    ...metaTheme,
    colors: {
      ...metaTheme?.colors,
      palette: { ...data },
    },
  });
};

const generateThemesFromPalettes = (metaTheme) => {
  return palettes.map(({ data, ...rest }) => ({
    ...rest,
    theme: generateThemeFromPalette(data, metaTheme),
  }));
};

const themes = generateThemesFromPalettes(metaTheme);

export { themes };
