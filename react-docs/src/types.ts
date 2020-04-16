export type Page = {
  title: string;
  id: string;
  component: React.FC;
  jsx?: JSX.Element;
};

export type PageGroup = {
  title: string;
  id: string;
  pages: Page[];
};

export type Pages = (Page | PageGroup)[];
