import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  List,
  ListItem,
} from "@chakra-ui/react";
import BasicNavItem from "./basic-nav-item";
import LinkedNavItem from "./linked-nav-item";

export default function NavDropdown({
  isSizeSmall,
  icon,
  title,
  activeFunctionByKey,
  onClickFunctionByKey,
  items,
}) {
  const isDropdownActive = items.some(({ id }) => activeFunctionByKey(id));

  const renderItem = ({ id, icon, title, link, isSizeSmall }) => (
    <ListItem key={id}>
      <LinkedNavItem
        icon={icon}
        title={title}
        active={activeFunctionByKey(id)}
        link={link}
        isSizeSmall={isSizeSmall}
        onClick={() => onClickFunctionByKey(id)}
        mt={0}
      />
    </ListItem>
  );

  return (
    <Accordion w="100%" allowToggle>
      <AccordionItem border="none">
        <h2>
          <AccordionButton
            p={0}
            m={0}
            _hover={{ bg: "none" }}
            _focus={{ boxShadow: "none" }}
          >
            <BasicNavItem
              icon={icon}
              title={title}
              active={isDropdownActive}
              isSizeSmall={isSizeSmall}
            />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <List spacing={3} listStyleType="none">
            {items.map((item) => renderItem(item))}
          </List>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
