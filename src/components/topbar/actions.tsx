import * as RadixIcons from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';
import Tooltip from 'src/components/tooltip';
import TopbarMenu from 'src/menus/topbar-menu';
import { configStore, localSrorageStore, uiStore } from 'src/stores';
import styled from 'styled-components';
import Button from '../button';
import Flex from '../flex';
import Padder from '../padder';

const Actions: FC = () => {
  const { data: config } = configStore();
  const { activeTheme, setLocalStorage } = localSrorageStore();
  const { activeSidebarMenuItem } = uiStore();

  const router = useRouter();

  if (!config) {
    return null;
  }

  const setThemeFun = () => {
    setLocalStorage(draft => {
      draft.activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    });
  };

  const sunIconProps = useSpring({
    config: { tension: 300 },
    position: 'absolute',
    opacity: activeTheme === 'dark' ? 1 : 0,
    transform: activeTheme === 'dark' ? 'translateY(0px)' : 'translateY(30px)',
  });
  const moonIconProps = useSpring({
    position: 'absolute',
    config: { tension: 300 },
    opacity: activeTheme === 'light' ? 1 : 0,
    transform: activeTheme === 'light' ? 'translateY(0px)' : 'translateY(30px)',
  });

  return (
    <Flex style={{ zIndex: 999999991 }}>
      <Devider />
      <Button
        onClick={() =>
          router.push(`/manage/${activeSidebarMenuItem || 'service'}`)
        }
        skin="default"
      >
        Manage
      </Button>
      <Padder x={12} />
      <TopbarMenu />
    </Flex>
  );
};

const Devider = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  width: 24px;
  height: 30px;

  :after {
    content: '';
    position: absolute;
    right: 12px;
    height: 60%;
    width: 1px;
    background: ${p => p.theme.border.primary};
  }
`;

export default Actions;
