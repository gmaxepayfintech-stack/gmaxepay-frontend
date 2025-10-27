import React, { createContext, useContext } from 'react';
import { controller } from '@material-tailwind/react';

const MaterialTailwindControllerContext = createContext(null);
export const MaterialTailwindControllerProvider = ({ children }) => {
  return <MaterialTailwindControllerContext.Provider value={controller}>{children}</MaterialTailwindControllerContext.Provider>;
};

export const useMaterialTailwindController = () => useContext(MaterialTailwindControllerContext);
