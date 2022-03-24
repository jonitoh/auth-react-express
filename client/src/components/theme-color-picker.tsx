import React from 'react';
import {
  Button,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Center,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import store, { GlobalState as State } from '../store';
import ColorTag from './color-tag';

// Selector for extracting global state
const themeSelector = (state: State) => ({
  getThemesAsOptions: state.getThemesAsOptions,
  setTheme: state.setTheme,
  theme: state.theme,
});

function ThemeColorPicker() {
  const { getThemesAsOptions, setTheme, theme } = store.fromSelector(themeSelector);
  const options = getThemesAsOptions();
  const defaultOption = options.find(({ value }) => value === theme);
  console.info('opts', options);
  console.info('def opts', defaultOption);

  const renderMenuItem = ({ value, label }: { value: string; label: string }) => (
    <MenuItem key={value} onClick={() => setTheme(value)}>
      <ColorTag text={label} mainColor={`palettes.${value}.primary-1`} />
    </MenuItem>
  );
  return (
    <>
      <Grid w="100vw" templateColumns="repeat(4, 1fr)" gap={6} p={3}>
        <GridItem h="10" bg="palette.primary-1" />
        <GridItem h="10" bg="palette.primary-2" />
        <GridItem h="10" bg="palette.primary-3" />
        <GridItem h="10" bg="palette.primary-4" />
      </Grid>
      <Flex p={4}>
        <Center>
          {defaultOption ? (
            <ColorTag
              text={defaultOption.label}
              mainColor="palette.primary-1"
              border="2px solid black"
              borderRadius="10px"
              maxH="50px"
              mr="2"
            />
          ) : null}
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Switch Palette
            </MenuButton>
            <MenuList>{options.map((opt) => renderMenuItem(opt))}</MenuList>
          </Menu>
        </Center>
      </Flex>
    </>
  );
}

export default ThemeColorPicker;
