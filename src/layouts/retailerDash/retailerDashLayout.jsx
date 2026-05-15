import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { useCompany } from "../../context/CompanyContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/action/userProfileAction";
import { useNotification } from "../../context/NotificationContext";
import { logOut, notificationIconMarksAsRead, notificationIconData } from "../../redux/action/loginAction";
import { getGreeting } from "../../utils/getGreeting";

// Use absolute paths for public folder assets
const MaskGroup = "/img/Maskgroup.png";
const MaskGroup1 = "/img/Maskgroup1.png";
const MaskGroup2 = "/img/Maskgroup2.png";
const MaskGroup3 = "/img/Maskgroup3.png";
const MaskGroup4 = "/img/Maskgroup4.png";
const MaskGroup5 = "/img/Maskgroup5.png";
const NotificationIcon = "/img/NotificationIcon.png";
const defaultProfileImage = "/img/defaultProfilelogo.png";
const companyLogo = "/img/gmaxepay.png";

const menuItems = [
  {
    name: "Dashboard",
    icon: MaskGroup,
    path: "/retailerDashboard/home",
    dropdown: false,
  },
  {
    name: "Services",
    icon: MaskGroup5,
    path: "/retailerDashboard/services",
    dropdown: false,
  },
  {
    name: "Txn History",
    icon: MaskGroup5,
    path: "/retailerDashboard/tax-history",
    dropdown: false,
  },
  {
    name: "Fund Manage",
    icon: MaskGroup4,
    dropdown: true,
    children: [
      {
        name: "Wallet Load",
        path: "/retailerDashboard/fund-management/wallet-load",
      },
    ],
  },
  {
    name: "Resources",
    icon: MaskGroup3,
    dropdown: true,
    children: [
      {
        name: "Subscription",
        path: "/retailerDashboard/resources/subscription",
      },
    ],
  },
  {
    name: "Help",
    icon: MaskGroup2,
    dropdown: true,
    children: [
      {
        name: "Contact Support",
        path: "/retailerDashboard/contact-support",
      },
    ],
  },
];

const RetailerDashLayout = ({ children }) => {
  const { company } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { email, name, unauthorized, error, loading, profile } = useSelector(
    (state) => state.userProfile,
  );

  // State for open dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // State for active (highlighted) main menu item - will be set based on route
  const [activeMenu, setActiveMenu] = useState("");
  // State for mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Handle unauthorized token expiration - redirect to login
  // useEffect(() => {
  //   if (unauthorized) {
  //     const errorMessage = error || "Invalid token. Please login again.";
  //     showNotification({
  //       message: errorMessage,
  //       type: "error",
  //       duration: 3000,
  //       isCritical: true, // Mark as critical so it shows on dashboard
  //     });
  //     // Redirect to login after a short delay to show notification
  //     setTimeout(() => {
  //       navigate("/auth/login", { replace: true });
  //     }, 500);
  //   }
  // }, [unauthorized, error, navigate, showNotification]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Set active menu based on current pathname
  useEffect(() => {
    const currentPath = location.pathname;

    // Check each menu item to see if current path matches
    for (const item of menuItems) {
      // Check if path matches exactly
      if (item.path && currentPath === item.path) {
        setActiveMenu(item.name);
        setOpenDropdown(null);
        return;
      }

      // Check if path starts with the menu item path (for sub-routes like /retailerDashboard/services/recharge)
      if (item.path && currentPath.startsWith(item.path + "/")) {
        setActiveMenu(item.name);
        setOpenDropdown(null);
        return;
      }

      // Check children paths for dropdown items
      if (item.children) {
        for (const child of item.children) {
          if (
            currentPath === child.path ||
            currentPath.startsWith(child.path + "/")
          ) {
            setActiveMenu(item.name);
            setOpenDropdown(item.name);
            return;
          }
        }
      }
    }

    // Default to Dashboard if no match found and we're on home
    if (
      currentPath === "/retailerDashboard/home" ||
      currentPath === "/retailerDashboard/"
    ) {
      setActiveMenu("Dashboard");
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const handleMenuClick = (name, dropdown, path) => {
    if (dropdown) {
      setOpenDropdown((prev) => (prev === name ? null : name));
      // also set it as active parent
      setActiveMenu(name);
    } else {
      // close any open dropdown
      setOpenDropdown(null);
      // mark this as active
      setActiveMenu(name);
      if (path) {
        navigate(path);
      }
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsProfileDropdownOpen(false);
      const companyId = company?.companyId || company?._id || company?.id || "";
      // Call the logout API - it will clear storage and handle errors internally
      const logoutPromise = dispatch(logOut({}, companyId));
      if (logoutPromise && typeof logoutPromise.then === "function") {
        await logoutPromise;
      }
      // Navigate to root after logout completes - InitialRoute will handle redirection
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to root (storage is cleared by logOut function)
      window.location.href = "/";
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Profile dropdown
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      // Notification dropdown
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isProfileDropdownOpen || isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, isNotificationOpen]);

  

  const { getNotificationsResponse } = useSelector((state) => state.login);
  const notifications = getNotificationsResponse?.data || {
    unreadNotifications: [],
    readNotifications: [],
    unreadCount: 0,
  };

  // Handle notification icon click
  const handleNotificationClick = () => {
    setIsNotificationOpen((prev) => !prev);
    if (!isNotificationOpen) {
      dispatch(notificationIconData());
      dispatch(notificationIconMarksAsRead());
    }
  };

  // Fetch notifications on mount for unread count
  useEffect(() => {
    dispatch(notificationIconData());
  }, [dispatch]);

  return (
    <div className="relative flex h-screen  text-[#1B1717] font-[Gilroy-Medium] overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[260px] max-w-[85%] bg-white lg:bg-[#0391550D] flex flex-col shadow-2xl rounded-r-xl transform transition-transform duration-300 lg:w-[277px] lg:translate-x-0 lg:shadow-lg lg:rounded-r-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ backgroundColor: isSidebarOpen ? "#FFFFFF" : undefined }}
      >
        {/* Logo */}
        <div className="p-6 text-center border-[#039155]/20 flex-shrink-0">
          <img
            src={company?.logo || companyLogo}
            alt="Company Logo"
            className="h-16 w-auto mx-auto mb-2 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = companyLogo;
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto overflow-x-hidden">
          {menuItems.map(({ name, icon, path, dropdown, children }) => {
            const isOpen = openDropdown === name;
            const isActiveParent = activeMenu === name;

            return (
              <div key={name}>
                {/* Main Menu Item */}
                <div
                  onClick={() => handleMenuClick(name, dropdown, path)}
                  className={`flex items-center justify-between gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 font-[Gilroy-Medium] ${isActiveParent
                    ? "bg-[#039155] text-white shadow-md"
                    : "text-gray-700 hover:bg-[#039155]/10 hover:text-[#039155]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={icon}
                      alt={name}
                      className={`w-5 h-5 object-contain ${isActiveParent ? "filter brightness-0 invert" : ""
                        }`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/gmaxepay.png";
                      }}
                    />
                    {dropdown ? (
                      path ? (
                        <Link to={path}>{name}</Link>
                      ) : (
                        <span>{name}</span>
                      )
                    ) : (
                      <Link to={path}>{name}</Link>
                    )}
                  </div>

                  {dropdown &&
                    (isOpen ? (
                      <ChevronUp className="w-4 h-4 text-white transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-300" />
                    ))}
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdown && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="bg-white rounded-2xl mt-2 shadow-sm py-2 px-3 space-y-1 border border-gray-100 overflow-hidden"
                    >
                      {children.map((child) => {
                        const isChildPathActive =
                          location.pathname === child.path;
                        return (
                          <Link
                            key={child.name}
                            to={child.path}
                            className={`flex items-center gap-2 py-2 px-3 text-md rounded-md transition-all duration-200 ${isChildPathActive
                              ? "text-[#039155] font-[Gilroy-Semibold]"
                              : "text-gray-700"
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke={
                                isChildPathActive ? "#039155" : "currentColor"
                              }
                              className="w-4 h-4 mr-3 transition-colors"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            {child.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 bg-[#FAFAFA] w-full min-h-screen overflow-hidden lg:ml-[277px]">
        {/* Header */}
        <header className="sticky top-4 mx-3 md:mx-5 lg:mx-6 rounded-xl bg-white px-4 sm:px-4 lg:px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0 z-20 shadow">
          <div className="flex items-center gap-3">
            <button
              className="md:p-2 rounded-md text-[#1B1717] focus:outline-none lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                (() => {
                  const greeting = getGreeting();
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <h1 className="text-sm sm:text-2xl font-[Gilroy-Semibold] text-[#1B1717]">
                          {greeting.text}!
                        </h1>
                        <img
                          src={greeting.image}
                          alt={greeting.text}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/gmaxepay.png";
                          }}
                        />
                      </div>
                      <p className="text-xs sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                        {name || email || "Admin"}
                      </p>
                    </>
                  );
                })()
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={handleNotificationClick}
                className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-[0.5px] border-[#1B1717]/80 transition hover:border-[#039155]/70 text-[#1B1717]/80 "
              >
                <img
                  src={NotificationIcon}
                  alt="Notifications"
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain  "
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/gmaxepay.png";
                  }}
                />
                {notifications?.totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.totalCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-[300px] sm:w-[400px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                      <h3 className="text-lg font-[Gilroy-Semibold] text-[#1B1717]">
                        Notifications
                      </h3>
                      {notifications?.totalCount > 0 && (
                        <span className="text-xs font-[Gilroy-Medium] text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                          {notifications.totalCount} Total
                        </span>
                      )}
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {notifications?.unreadNotifications?.length === 0 &&
                      notifications?.readNotifications?.length === 0 ? (
                        <div className="p-10 text-center">
                          <img
                            src="/img/no-notifications.png"
                            alt="No notifications"
                            className="w-16 h-16 mx-auto mb-4 opacity-20"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/img/gmaxepay.png";
                            }}
                          />
                          <p className="text-gray-400 text-sm">No notifications found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {/* Unread Section */}
                          {notifications?.unreadNotifications?.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-4 hover:bg-gray-50 transition-colors bg-[#039155]/5 border-l-4 border-[#039155]"
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-[Gilroy-Semibold] text-sm text-[#1B1717]">
                                  {notif.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-[Gilroy-Medium]">
                                {notif.msg}
                              </p>
                            </div>
                          ))}

                          {/* Read Section */}
                          {notifications?.readNotifications?.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-[Gilroy-Medium] text-sm text-gray-500">
                                  {notif.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 font-[Gilroy-Medium]">
                                {notif.msg}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                      <button 
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-xs font-[Gilroy-Semibold] text-gray-500 hover:text-[#039155] transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2" ref={profileDropdownRef}>
              <span
                className="hidden text-lg font-[Gilroy-Semibold] text-[#1B1717] sm:inline max-w-[150px] md:max-w-[200px] xl:max-w-[250px] truncate"
                title={`${profile?.outlet || ''} - Retailer`}
              >
                {profile?.outlet} - Retailer
              </span>
              <button
                onClick={toggleProfileDropdown}
                className="focus:outline-none  rounded-full"
                aria-label="Profile menu"
              >
                <img
                  src={profile?.profileImage || defaultProfileImage}
                  alt="Profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfileImage;
                  }}
                />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <Link
                      to="/retailerDashboard/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#1B1717] hover:bg-gray-100 transition-colors"
                    >
                      Profile
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#1B1717] hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Rounded bottom border line */}
          {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-[1px] bg-[#1B1717]/80 "></div> */}
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full p-2 sm:p-4 bg-[#FAFAFA] lg:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RetailerDashLayout;
