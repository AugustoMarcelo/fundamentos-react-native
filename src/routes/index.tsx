import React from 'react';
import { StatusBar } from 'react-native';

import AppRoutes from './app.routes';

const Routes: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#D8D8DD" />
      <AppRoutes />
    </>
  );
};

export default Routes;
