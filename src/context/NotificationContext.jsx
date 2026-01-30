import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

let globalNotificationHandler = null;

export const setGlobalNotificationHandler = (handler) => {
  globalNotificationHandler = handler;
};

export const getGlobalNotificationHandler = () => globalNotificationHandler;

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Define removeNotification first
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      // Call onClose callback if provided
      if (notification?.onClose && typeof notification.onClose === 'function') {
        notification.onClose();
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  // Now define showNotification which depends on removeNotification
  const showNotification = useCallback((messageOrConfig, type = 'info', duration = 5000) => {
    // Handle both object config and individual parameters
    const message = typeof messageOrConfig === 'string' ? messageOrConfig : messageOrConfig.message;
    const notificationType = typeof messageOrConfig === 'string' ? type : (messageOrConfig.type || 'info');
    const notificationDuration = typeof messageOrConfig === 'string' ? duration : (messageOrConfig.duration || 5000);
    const onClose = typeof messageOrConfig === 'object' ? messageOrConfig.onClose : null;
    const clearExisting = typeof messageOrConfig === 'object' ? (messageOrConfig.clearExisting !== false) : true;
    const isCritical = typeof messageOrConfig === 'object' ? (messageOrConfig.isCritical || false) : false;
    
    // Clear all existing notifications before showing new one (unless specified otherwise)
    if (clearExisting) {
      setNotifications([]);
    }
    
    const id = Date.now() + Math.random();
    const notification = { id, message, type: notificationType, duration: notificationDuration, onClose, isCritical };
    
    setNotifications((prev) => clearExisting ? [notification] : [...prev, notification]);

    // Auto remove after duration
    if (notificationDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notificationDuration);
    }

    return id;
  }, [removeNotification]);

  const success = useCallback((message, duration) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const error = useCallback((message, duration) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const value = {
    showNotification,
    removeNotification,
    success,
    error,
  };

  // Set global notification handler so it can be used outside React components
  useEffect(() => {
    setGlobalNotificationHandler({
      showNotification,
      error,
      success,
    });
  }, [showNotification, error, success]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  
  // Update path when it changes (for SPA navigation)
  useEffect(() => {
    let lastPath = window.location.pathname;
    
    // Check for pathname changes periodically (lightweight check)
    const checkPath = () => {
      const currentPathname = window.location.pathname;
      if (currentPathname !== lastPath) {
        lastPath = currentPathname;
        setCurrentPath(currentPathname);
      }
    };
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', checkPath);
    
    // Check every 200ms for route changes (React Router updates window.location.pathname)
    const interval = setInterval(checkPath, 200);
    
    return () => {
      window.removeEventListener('popstate', checkPath);
      clearInterval(interval);
    };
  }, []);
  
  if (notifications.length === 0) return null;

  // Check if we're on a dashboard route (use current pathname directly for accuracy)
  const pathname = currentPath || window.location.pathname;
  const isDashboardRoute = pathname.startsWith('/superDashboard') || 
                          pathname.startsWith('/adminDashboard') ||
                          pathname.startsWith('/subAdminDashboard') ||
                          pathname.startsWith('/retailerDashboard') ||
                          pathname.startsWith('/superDashboard') ||
                          pathname.startsWith('/masterDistributerDashboard') ||
                          pathname.startsWith('/distributerDashboard') ||
                          pathname.startsWith('/employeeDashboard');

  // On dashboard routes, only show critical notifications (like token expiration)
  // Otherwise, show all notifications
  const notificationsToShow = isDashboardRoute 
    ? notifications.filter(n => n.isCritical)
    : notifications;

  if (notificationsToShow.length === 0) return null;

  return (
    <div
      className="
        fixed z-50 flex flex-col gap-2 sm:gap-3
        inset-x-0 top-2 items-center px-2
        sm:inset-auto sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-4 lg:right-4 sm:bottom-auto sm:items-end sm:px-0
      "
    >
      {notificationsToShow.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const { message, type, id } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          title: 'text-green-700',
          icon: 'text-green-600',
          hover: 'hover:bg-green-100',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          title: 'text-red-700',
          icon: 'text-red-600',
          hover: 'hover:bg-red-100',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          title: 'text-blue-700',
          icon: 'text-blue-600',
          hover: 'hover:bg-blue-100',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          title: 'text-yellow-700',
          icon: 'text-yellow-600',
          hover: 'hover:bg-yellow-100',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          title: 'text-blue-700',
          icon: 'text-blue-600',
          hover: 'hover:bg-blue-100',
        };
    }
  };

  const colors = getColors();

  const getTitle = () => {
    switch (type) {
      case 'success': return 'SUCCESS!';
      case 'error': return 'ERROR!';
      case 'info': return 'INFO!';
      case 'warning': return 'WARNING!';
      default: return 'INFO!';
    }
  };

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.hover}
        w-full max-w-[calc(100vw-1rem)] sm:max-w-sm md:max-w-md lg:max-w-lg
        rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border-2 
        px-2.5 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 lg:px-6 lg:py-5
        backdrop-blur-sm transition-all duration-300
        animate-slide-in-right transform hover:scale-[1.01]
      `}
    >
      <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${colors.title} font-bold text-[11px] sm:text-xs md:text-sm lg:text-base mb-0.5 sm:mb-1`}>
            {getTitle()}
          </h3>
          <p className={`${colors.text} text-[10px] sm:text-xs md:text-sm lg:text-sm leading-relaxed break-words font-medium`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`
            ${colors.icon} hover:opacity-70 hover:scale-110
            flex-shrink-0 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-0.5 sm:p-1
          `}
          aria-label="Close notification"
          type="button"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

