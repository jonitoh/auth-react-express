import React from 'react';
import { Flex, FormLabel as ChakraFormLabel } from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';

type Props = {
  withCheck?: boolean;
  htmlFor: string | undefined;
  label: string;
  onCheckCondition?: boolean;
  onUncheckCondition?: boolean;
};

function FormLabel({ withCheck, htmlFor, label, onCheckCondition, onUncheckCondition }: Props) {
  return (
    <Flex justify="space-between">
      <ChakraFormLabel htmlFor={htmlFor} display="flex">
        {label}
      </ChakraFormLabel>
      {withCheck && onCheckCondition && <FiCheck color="green" />}
      {withCheck && onUncheckCondition && <FiX color="red" />}
    </Flex>
  );
}

FormLabel.defaultProps = {
  withCheck: true,
  onCheckCondition: true,
  onUncheckCondition: false,
};

export default FormLabel;
