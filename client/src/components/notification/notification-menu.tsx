import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, IconButton, Center } from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';
import NotificationItem from './notification-item';
import { Notification } from '../../store/notification.slice';

type Props = {
  notifications: Notification[];
  deleteOne: (id: string) => void;
  updateOne: (id: string, data: Partial<Notification>) => void;
};

export default function NotificationMenu({ notifications, updateOne, deleteOne }: Props) {
  function renderNotification(item: Notification) {
    function update(data: Partial<Notification>) {
      updateOne(item.id, data);
    }

    function remove() {
      deleteOne(item.id);
    }

    return (
      <MenuItem key={item.id}>
        <NotificationItem item={item} update={update} remove={remove} />
      </MenuItem>
    );
  }
  const numberOfUnreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <Menu>
      <MenuButton
        m="5px"
        as={IconButton}
        aria-label="Notifications"
        icon={<FiBell />}
        variant="ghost"
      />
      {numberOfUnreadNotifications !== 0 && (
        <Center
          borderRadius="50%"
          bg="blue"
          w="15px"
          h="15px"
          color="white"
          fontSize="60%"
          position="relative"
          right="25px"
          top="-5px"
        >
          {numberOfUnreadNotifications}
        </Center>
      )}
      <MenuList>{notifications.map((n) => renderNotification(n))}</MenuList>
    </Menu>
  );
}
