import React from 'react';
import { useCompany } from '../context/CompanyContext';
import { LoginDesign1 } from '../login';
import Loader from '../widgets/layout/loader';

const Auth = () => {
  const { company, loading } = useCompany();

  if (loading) {
    return <Loader />;
  }

  // Determine which login design to show based on company's singupPageDesign
  const designNumber = company?.singupPageDesign || 1;
  
  // Currently only design 1 is implemented
  return <LoginDesign1 />;
};

export default Auth;
