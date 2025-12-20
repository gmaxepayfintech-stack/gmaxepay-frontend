import { MaterialTailwindControllerProvider } from './context';
import { NotificationProvider } from './context/NotificationContext';
import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import '../public/css/tailwind.css';
import App from './App';
import { store } from './redux/store'; 
import { CompanyProvider, useCompany } from './context/CompanyContext';

// Wrapper component to wait for company data to load
const AppWithCompany = () => {
  const { loading } = useCompany();

  // Wait for company data to load before rendering App
  if (loading) {
    return null;
  }

  // Render App only after company data is loaded
  return (
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <MaterialTailwindControllerProvider>
        <Provider store={store}>
          <CompanyProvider>
            <AppWithCompany />
          </CompanyProvider>
        </Provider>
      </MaterialTailwindControllerProvider>
    </ThemeProvider>
  </React.StrictMode>
);
