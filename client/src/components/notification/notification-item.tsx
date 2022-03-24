import React from 'react';
import { Box, useDisclosure, Flex, Text } from '@chakra-ui/react';
import { Notification } from '../../store/notification.slice';
import NotificationDialog from './notification-dialog';

type Props = {
  item: Notification;
  remove: () => void;
  update: (data: Partial<Notification>) => void;
};

export default function NotificationItem({ item, update, remove }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { title, message } = item.content;
  return (
    <>
      <Flex direction="column" w="100%">
        <Box onClick={onOpen} bg={item.read ? 'none' : 'yellow'}>
          Open {title}
          <Box>date {item.date}</Box>
          <Text isTruncated>{message}</Text>
        </Box>
      </Flex>
      <NotificationDialog
        isOpen={isOpen}
        onClose={onClose}
        item={item}
        update={update}
        remove={remove}
      />
    </>
  );
}
