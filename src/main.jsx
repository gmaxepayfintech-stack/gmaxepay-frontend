import { MaterialTailwindControllerProvider } from './context';
import { NotificationProvider } from './context/NotificationContext';
import '@/styles/globals.css';
import { ThemeProvider } from '@material-tailwind/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import '@/styles/globals.css';
import App from './App';
import { store } from './redux/store'; 
import { CompanyProvider, useCompany } from './context/CompanyContext';

const AppWithCompany = () => {
  const { loading } = useCompany();
  if (loading) {
    return null;
  }
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