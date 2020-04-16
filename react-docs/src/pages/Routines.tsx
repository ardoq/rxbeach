import React from 'react';
import { MainHeading } from './atoms';

const Routines = () => {
  return (
    <div>
      <MainHeading>Routines</MainHeading>
      <p>Todo...</p>
    </div>
  );
};

export default {
  id: 'routines',
  title: 'Routines (side-effects)',
  component: Routines,
};
