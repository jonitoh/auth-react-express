import React from 'react';
import { IconType } from 'react-icons';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  List,
  ListItem,
} from '@chakra-ui/react';
import BasicNavItem from './basic-nav-item';
import LinkedNavItem from './linked-nav-item';
import { NavItemAsItemData } from '../../data/nav-items';

type Props = {
  isSizeSmall: boolean;
  icon: IconType;
  title: string;
  activeFunctionByKey: (id: string) => boolean;
  onClickFunctionByKey: (id: string) => void;
  items: NavItemAsItemData[];
};

export default function NavDropdown({
  isSizeSmall,
  icon,
  title,
  activeFunctionByKey,
  onClickFunctionByKey,
  items,
}: Props) {
  const isDropdownActive = items.some(({ id }) => activeFunctionByKey(id));

  // eslint-disable-next-line no-shadow
  function renderItem(item: NavItemAsItemData, isSizeSmall: boolean) {
    return (
      <ListItem key={item.id}>
        <LinkedNavItem
          icon={item.icon}
          title={item.title}
          active={activeFunctionByKey(item.id)}
          link={item.link}
          isSizeSmall={isSizeSmall}
          onClick={() => onClickFunctionByKey(item.id)}
          mt={0}
        />
      </ListItem>
    );
  }

  return (
    <Accordion w="100%" allowToggle>
      <AccordionItem border="none">
        <h2>
          <AccordionButton p={0} m={0} _hover={{ bg: 'none' }} _focus={{ boxShadow: 'none' }}>
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
            {items.map((item) => renderItem(item, isSizeSmall))}
          </List>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
