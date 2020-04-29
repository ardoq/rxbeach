import React from 'react';
import { Menu } from 'antd';
import { Page, Pages } from './types';
import styled from 'styled-components';
import { isPageGroup } from './typeGuards';
import { findPageById } from './utils';

const { SubMenu } = Menu;

type ViewProps = {
  selectPage: (page: Page) => void;
  pages: Pages;
  selectedPage: Page;
};

const StyledMenu = styled(Menu)`
  h2 {
    margin-bottom: 40px;
  }
  padding-left: 50px;
`;

const SideMenu = ({ selectPage, pages, selectedPage }: ViewProps) => {
  return (
    <StyledMenu
      onClick={({ key }) => {
        const newSelection = findPageById(pages, key);
        if (newSelection) {
          selectPage(newSelection);
        }
      }}
      defaultOpenKeys={pages
        .filter(page => isPageGroup(page))
        .map(page => page.id)}
      selectedKeys={[selectedPage.id]}
      mode="inline"
    >
      <h2>🏖️ RxBeach</h2>
      {pages.map(page =>
        isPageGroup(page) ? (
          <SubMenu key={page.id} title={page.title}>
            {page.pages.map(subPage => {
              return <Menu.Item key={subPage.id}>{subPage.title}</Menu.Item>;
            })}
          </SubMenu>
        ) : (
          <Menu.Item key={page.id}>{page.title}</Menu.Item>
        ),
      )}
    </StyledMenu>
  );
};

export default SideMenu;
