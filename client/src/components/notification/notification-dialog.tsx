import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
} from '@chakra-ui/react';
import { Notification } from '../../store/notification.slice';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  remove: () => void;
  update: (data: Partial<Notification>) => void;
  item: Notification;
};

export default function NotificationDialog({ isOpen, onClose, update, remove, item }: Props) {
  const { title, message } = item.content;
  const removeAndClose = () => {
    // remove the notification
    remove();
    onClose();
  };

  const updateReadAndClose = () => {
    // update the notification
    update({ read: !item.read });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${item.date} -- ${title}`}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={removeAndClose}>
            Delete and close
          </Button>
          <Button variant="ghost" onClick={updateReadAndClose}>
            Mark as {item.read ? 'Unread' : 'Read'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
