import React from 'react';
import styled from 'styled-components';
import SideMenu from './SideMenu';
import allPages from './pages';
import { Layout } from 'antd';
import { connect } from 'rxbeach/react';
import { router$, selectPage } from './router/router$';
import { isPageGroup } from './typeGuards';
import { findPageById } from './utils';
import { Pages, Page } from './types';

export const OuterLayout = styled(Layout)`
  background-color: white;
  margin: 0 auto;
  max-width: 1200px;
  padding-top: 50px;

  .ant-layout-content {
    background-color: white;
    padding: 0 50px;
  }

  .ant-layout-sider {
    background-color: white;
  }
`;

const getSelectedPage = (pages: Pages, selectedPageId: string | null): Page => {
  return (
    (selectedPageId && findPageById(pages, selectedPageId)) ||
    (pages.find((p) => !isPageGroup(p)) as Page)
  );
};

type ViewProps = {
  selectedPageId: string | null;
};

const App = ({ selectedPageId }: ViewProps) => {
  const selectedPage = getSelectedPage(allPages, selectedPageId);
  return (
    <OuterLayout>
      <Layout>
        <Layout.Sider width={350}>
          <SideMenu
            selectedPage={selectedPage}
            selectPage={(page) => selectPage(page.id)}
            pages={allPages}
          />
        </Layout.Sider>
        <Layout.Content>
          <selectedPage.component />
        </Layout.Content>
      </Layout>
    </OuterLayout>
  );
};

export default connect(App, router$);
