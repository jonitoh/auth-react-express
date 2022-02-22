import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
} from "@chakra-ui/react";

export default function NotificationDialog({
  isOpen,
  onClose,
  update,
  remove,
  content,
  date,
  read,
}) {
  const { title, message } = content;
  const removeAndClose = () => {
    //remove the notification
    remove();
    onClose();
  };

  const updateReadAndClose = () => {
    // update the notification
    update({ read: !read });
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${date} -- ${title}`}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={removeAndClose}>
            Delete and close
          </Button>
          <Button variant="ghost" onClick={updateReadAndClose}>
            Mark as {read ? "Unread" : "Read"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
