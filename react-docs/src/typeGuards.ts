import { PageGroup, Page } from './types';

export const isPageGroup = (page: Page | PageGroup): page is PageGroup =>
  Boolean((page as any).pages);
