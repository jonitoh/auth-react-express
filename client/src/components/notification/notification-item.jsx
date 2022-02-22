import React, { Fragment } from "react";
import { Box, useDisclosure, Flex, Text } from "@chakra-ui/react";
import NotificationDialog from "./notification-dialog";

export default function NotificationItem({
  content,
  read,
  level,
  update,
  remove,
  date,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { title, message } = content;
  return (
    <Fragment>
      <Flex direction="column" w="100%">
        <Box onClick={onOpen} bg={read ? "none" : "yellow"}>
          Open {title}
          <Box>date {date}</Box>
          <Text isTruncated>{message}</Text>
        </Box>
      </Flex>
      <NotificationDialog
        isOpen={isOpen}
        onClose={onClose}
        content={content}
        update={update}
        remove={remove}
        date={date}
        read={read}
      />
    </Fragment>
  );
}
