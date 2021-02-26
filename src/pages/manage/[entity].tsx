import { useRouter } from 'next/router';
import React, { FC, ReactElement, useMemo } from 'react';
import * as Entities from 'server/entities';
import { SideBarMenuItem } from 'shared/types/internal';
import Flex from 'src/components/flex';
import { Sidebar } from 'src/components/sidebar';
import ManageServiceList from 'src/scences/manage/service-list';
import { configStore, localSrorageStore, uiStore } from 'src/stores';
import styled from 'styled-components';

const MENU_ITEMS: SideBarMenuItem[] = [
  { id: 'service', label: 'Services', icon: 'CubeIcon' },
  { id: 'category', label: 'Categories', icon: 'IdCardIcon' },
  { id: 'note', label: 'Notes', icon: 'ChatBubbleIcon' },
];

interface ManageScences {
  path: Lowercase<keyof typeof Entities>;
  component: ReactElement;
}

const SCENCES: ManageScences[] = [
  { path: 'service', component: <ManageServiceList /> },
  { path: 'category', component: <ManageServiceList /> },
  { path: 'note', component: <ManageServiceList /> },
];

const Index: FC = () => {
  const { activeTheme } = localSrorageStore();
  const { data: config } = configStore();
  const { setUiStore } = uiStore();

  const router = useRouter();

  // const [ctxScene] = useState(
  //   SCENCES.find(scene => scene.path === router.query.entity),
  // );

  const ctxScene = useMemo(
    () => SCENCES.find(scene => scene.path === router.query.entity),
    [router.query.entity],
  );

  const onMenuItemClickHandler = (item: SideBarMenuItem) => {
    setUiStore(d => {
      d.activeSidebarMenuItem = item.id;
    });
    router.replace(`/manage/${item.id.toLowerCase()}`);
  };

  return (
    <Flex>
      <Sidebar
        menuItems={MENU_ITEMS}
        activeSidebarMenuItemId={router.query.entity as SideBarMenuItem['id']}
        config={config as Entities.Config}
        activeTheme={activeTheme}
        onMenuItemClick={onMenuItemClickHandler}
      />
      <Grid>{ctxScene && ctxScene.component ? ctxScene.component : null}</Grid>
    </Flex>
  );
};

const Grid = styled.section`
  max-width: 1440px;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
`;

export default Index;
