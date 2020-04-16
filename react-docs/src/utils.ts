import { Page, Pages } from './types';
import { isPageGroup } from './typeGuards';

export const stripIndent = (string: string): string => {
  const lines = string
    .replace(/^\n/, '')
    .replace(/\n$/, '')
    .split('\n');

  const firstLineWhitespace = lines[0].match(/^\s+/);
  if (!firstLineWhitespace) return lines.join('\n');

  const stringToReplace = firstLineWhitespace[0];
  const replaceRE = new RegExp(`^${stringToReplace}`);
  return lines.map(line => line.replace(replaceRE, '')).join('\n');
};

export const convertStringToId = (str: string): string =>
  str.replace(/\W/g, '-');

export const findPageById = (pages: Pages, id: string): Page | null => {
  const pageOrPageGroup = pages.find(page => {
    if (!isPageGroup(page)) {
      return page.id === id;
    }
    return page.pages.find(subPage => id === subPage.id);
  });
  if (!pageOrPageGroup) return null;
  return isPageGroup(pageOrPageGroup)
    ? pageOrPageGroup.pages.find(subPage => id === subPage.id)!
    : pageOrPageGroup;
};
