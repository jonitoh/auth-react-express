import React, { Fragment } from "react";
import { IconButton, Box, Heading } from "@chakra-ui/react";

export default function Logo({
  showLabel = true,
  label = "Logo",
  icon,
  onClickLogo = () => null,
  withWrapper = false,
  asWrapper,
  ...rest
}) {
  const Component = withWrapper || asWrapper ? asWrapper || Box : Fragment;
  const props =
    withWrapper || asWrapper
      ? rest
      : { key: rest.key, children: rest.children };
  return (
    <Component {...props}>
      <IconButton
        background="none"
        _hover={{ background: "none" }}
        icon={icon}
        onClick={onClickLogo}
      />
      {showLabel && (
        <Heading as="h3" fontSize="lg">
          {label}
        </Heading>
      )}
    </Component>
  );
}
