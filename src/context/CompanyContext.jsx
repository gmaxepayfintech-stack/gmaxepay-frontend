import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_ROUTE } from '../data/env';

const CompanyContext = createContext();
export const useCompany = () => useContext(CompanyContext);

// Global flag to prevent duplicate API calls
let isApiCallInProgress = false;
let companyDataPromise = null;

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchCompany = async () => {
      // If API call is already in progress, wait for it
      if (isApiCallInProgress && companyDataPromise) {
        try {
          const result = await companyDataPromise;
          setCompany(result);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Failed to load company data:', error);
          setLoading(false);
          return;
        }
      }

      // Start new API call
      isApiCallInProgress = true;
      
      companyDataPromise = (async () => {
        try {
          const domain = window.location.hostname;
          const res = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/get?domain=${domain}`
          );
          
          const companyData = res.data.data;
          
          // Set document title
          if (companyData?.companyName) {
            document.title = companyData.companyName;
          }
          
          // Set favicon
          if (companyData?.favicon) {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.href = companyData.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          
          return companyData;
        } catch (error) {
          console.error('Failed to load company data:', error);
          throw error;
        } finally {
          isApiCallInProgress = false;
        }
      })();

      try {
        const result = await companyDataPromise;
        setCompany(result);
      } catch (error) {
        // Error already logged above
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};
