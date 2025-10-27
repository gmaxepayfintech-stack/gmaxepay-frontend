import React from 'react';
import { useCompany } from '../context/CompanyContext';

const HeadUpdater = () => {
  const { company } = useCompany();

  React.useEffect(() => {
    if (company?.favicon) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = company.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (company?.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', company.primaryColor);
    }

    if (company?.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', company.secondaryColor);
    }
  }, [company]);

  return null;
};

export default HeadUpdater;
