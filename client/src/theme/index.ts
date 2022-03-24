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
import { extendTheme } from '@chakra-ui/react';
import { Dict } from '@chakra-ui/utils';
import { palettes, Palette } from './palettes';

type Theme = {
  theme: Dict<any>; // va falloir add chakra
  name: string;
  label: string;
};

const metaGenericTheme: Dict<any> = {};
/*
colors: {
  palettes: {
    [name]: data,
  }
}
*/

function generateThemeFromPalette(data: Object, metaTheme: Dict<any>): Dict<any> {
  return extendTheme({
    ...metaTheme,
    colors: {
      ...metaTheme?.colors,
      palette: { ...data },
    },
  });
}

function generateThemesFromPalettes(metaTheme: Dict<any>): Theme[] {
  // create a meta theme with all the available themes
  let ourMetaTheme: Dict<any> = metaTheme;
  ourMetaTheme = {
    ...ourMetaTheme,
    colors: {
      ...ourMetaTheme?.colors,
      palettes: palettes
        .map((p: Palette) => ({ [p.name]: p.data }))
        .reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            ...currentValue,
          }),
          {}
        ),
    },
  };
  // create all the available themes
  let themes: Theme[] = [];
  themes = palettes.map(({ data, ...rest }) => ({
    ...rest,
    theme: generateThemeFromPalette(data, ourMetaTheme),
  }));

  return themes;
}

const themes: Theme[] = generateThemesFromPalettes(metaGenericTheme);

export { themes, Theme };
