/*
Only two possible size: small or large aka not small
*/
import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { FiChevronsRight, FiChevronsLeft } from 'react-icons/fi';
import { BsFillEmojiSunglassesFill } from 'react-icons/bs';
import Logo from '../logo';
import { emptyFunction } from '../../utils/main';
import { SizedWrapper } from './wrapper';

type MainMenuIconProps = {
  isSizeSmall: boolean;
  label?: string;
  onClickLogo?: () => void;
  onClickArrow?: () => void;
};

function MainMenuIcon({ isSizeSmall, label, onClickLogo, onClickArrow }: MainMenuIconProps) {
  const Wrapper = React.useCallback((props) => SizedWrapper(props, isSizeSmall), [isSizeSmall]);

  return (
    <Wrapper>
      <Logo
        showLabel={!isSizeSmall}
        label={label}
        icon={<BsFillEmojiSunglassesFill />}
        onClick={onClickLogo}
      />
      <IconButton
        zIndex="3"
        position={isSizeSmall ? 'absolute' : 'relative'}
        right={isSizeSmall ? '-30%' : '-10%'}
        borderRadius="50%"
        icon={isSizeSmall ? <FiChevronsRight /> : <FiChevronsLeft />}
        onClick={onClickArrow}
        aria-label={isSizeSmall ? 'small sidebar' : 'large sidebar'}
      />
    </Wrapper>
  );
}

MainMenuIcon.defaultProps = {
  label: 'Logo',
  onClickLogo: emptyFunction,
  onClickArrow: emptyFunction,
};

export default MainMenuIcon;
