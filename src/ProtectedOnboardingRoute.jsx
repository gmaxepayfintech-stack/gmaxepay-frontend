import React from 'react';
import { Navigate } from 'react-router-dom';
import NotFound from './pages/notFound';
import { ALLOWED_ONBOARDING_DOMAIN } from './data/env';

const ProtectedOnboardingRoute = ({ children }) => {
  const currentDomain = window.location.hostname;
  const isDevelopment = currentDomain === 'localhost' || currentDomain === '127.0.0.1' || currentDomain.includes('localhost');
  
  // In development, allow everything
  if (isDevelopment) {
    return children;
  }
  
  // In production, check if domain matches allowed domain
  const allowedDomains = ALLOWED_ONBOARDING_DOMAIN.split(',').map(domain => domain.trim());
  const isAllowed = allowedDomains.some(domain => 
    currentDomain === domain || currentDomain.endsWith(`.${domain}`)
  );
  
  if (!isAllowed) {
    return <NotFound />;
  }
  
  return children;
};

export default ProtectedOnboardingRoute;

