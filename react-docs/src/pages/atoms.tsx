import React from 'react';
import { convertStringToId } from '../utils';

export const MainHeading: React.FC = ({ children }) => {
  return <h2>{children}</h2>;
};

type SubHeaderProps = {
  title: string;
};
export const SubHeader = (props: SubHeaderProps) => {
  const id = convertStringToId(props.title);
  return (
    <h3 id={id}>
      <a href={`#${id}`}>{props.title}</a>
    </h3>
  );
};
