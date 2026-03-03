import React from 'react';
import { useCompany } from '../context/CompanyContext';
import { LoginDesign1, LoginDesign2 } from '../login';
// import Loader from '../widgets/layout/loader';

const Auth = () => {
  const { company, loading } = useCompany();

  // Removed loader for faster page load
  // if (loading) {
  //   return <Loader />;
  // }

  // Determine which login design to show based on company's singupPageDesign
  const designNumber = company?.singupPageDesign || 1;
  
  // Render the appropriate design based on singupPageDesign value
  if (designNumber === 2) {
    return <LoginDesign2 />;
  }
  
  // Default to design 1
  return <LoginDesign1 />;
};

export default Auth;
