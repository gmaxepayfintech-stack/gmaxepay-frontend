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
  
  // Extract base domain (e.g., "gmaxepay.in" from "app.gmaxepay.in")
  const getBaseDomain = (domain) => {
    const parts = domain.split('.');
    // If domain has 2+ parts, take the last 2 (e.g., "gmaxepay.in")
    // If it has 3+ parts, take the last 2 (e.g., "gmaxepay.in" from "app.gmaxepay.in")
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return domain;
  };
  
  const isAllowed = allowedDomains.some(domain => {
    // Exact match
    if (currentDomain === domain) return true;
    
    // Subdomain match (e.g., "npay.gmaxepay.in" ends with ".gmaxepay.in")
    if (currentDomain.endsWith(`.${domain}`)) return true;
    
    // Check if current domain is a subdomain of the base domain
    const baseDomain = getBaseDomain(domain);
    if (currentDomain === baseDomain) return true;
    if (currentDomain.endsWith(`.${baseDomain}`)) return true;
    
    return false;
  });
  
  if (!isAllowed) {
    return <NotFound />;
  }
  
  return children;
};

export default ProtectedOnboardingRoute;

