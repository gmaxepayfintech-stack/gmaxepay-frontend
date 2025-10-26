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
import { CompanyProvider } from './context/CompanyContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <MaterialTailwindControllerProvider>
        <Provider store={store}>
          <CompanyProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </CompanyProvider>
        </Provider>
      </MaterialTailwindControllerProvider>
    </ThemeProvider>
  </React.StrictMode>
);
