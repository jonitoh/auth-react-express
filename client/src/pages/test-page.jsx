import React, { Fragment } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Center,
  Spacer,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useStore } from "store";

const Tag = ({ text, mainColor, ...props }) => {
  return (
    <Flex p="1" {...props} justify="center">
      <Text p="1">{text}</Text>
      <Spacer />
      <Box w="2rem" h="2rem" p="1" borderRadius="50%" bg={mainColor} />
    </Flex>
  );
};

const Test = () => {
  const { getAllThemesAsOptions, setTheme, theme } = useStore();
  const options = getAllThemesAsOptions();
  const defaultOption = options.find(({ value }) => value === theme);

  const renderMenuItem = ({ value, label }) => (
    <MenuItem key={value} onClick={() => setTheme(value)}>
      <Tag text={label} mainColor={"palettes.primary-1"} />
    </MenuItem>
  );
  // <p>Homepage for Color Mode</p>
  return (
    <Fragment>
      <Grid w="100vw" templateColumns="repeat(4, 1fr)" gap={6} p={3}>
        <GridItem h="10" bg="palette.primary-1" />
        <GridItem h="10" bg="palette.primary-2" />
        <GridItem h="10" bg="palette.primary-3" />
        <GridItem h="10" bg="palette.primary-4" />
      </Grid>
      <Flex p={4}>
        <Center>
          <Tag
            text={defaultOption.label}
            mainColor={"palette.primary-1"}
            border="2px solid black"
            borderRadius="10px"
            maxH="50px"
            mr="2"
          />
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Switch Palette
            </MenuButton>
            <MenuList>{options.map((opt) => renderMenuItem(opt))}</MenuList>
          </Menu>
        </Center>
      </Flex>
    </Fragment>
  );
};

export default Test;
