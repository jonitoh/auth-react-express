import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Box,
  Center,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import NotificationItem from "./notification-item";

export default function NotificationMenu({
  notifications,
  updateNotification,
  removeNotification,
}) {
  const renderNotification = ({ id, date, content, read, level }) => {
    const update = (data) => updateNotification(id, data);
    const remove = () => removeNotification(id);
    return (
      <MenuItem key={id}>
        <NotificationItem
          date={date}
          content={content}
          read={read}
          update={update}
          remove={remove}
          level={level}
        />
      </MenuItem>
    );
  };
  const numberOfUnreadNotifications = notifications.filter(
    (n) => !n.read
  ).length;

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
