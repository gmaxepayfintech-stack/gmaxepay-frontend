import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "../context/NotificationContext";
import { logOut } from "../redux/action/loginAction";
import { getGreeting } from "../utils/getGreeting";
import { getAdminDetails } from "../redux/action/userProfileAction";

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

const DashboardLayout = ({ children }) => {
  const { company } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { email, name, error, loading, profile } = useSelector(
    (state) => state.userProfile,
  );

  // State for open dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // State for active (highlighted) main menu item
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  // State for mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for profile dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const menuItems = [
    {
      name: "Dashboard",
      icon: MaskGroup,
      path: "/superDashboard/home",
      dropdown: false,
    },
    {
      name: "Members",
      icon: MaskGroup1,
      dropdown: true,
      path: null,
      children: [
        { name: "Users", path: "/superDashboard/members/user" },
        // { name: "Agents", path: "/superDashboard/members/list" },
        {
          name: "Role Management",
          path: "/superDashboard/members/rolemanagement",
        },
      ],
    },
    {
      name: "API Operator",
      icon: MaskGroup2,
      dropdown: true,
      children: [
        { name: "BBPS Settings", path: "/superDashboard/bbps-settings/list" },
        // { name: "API Settings", path: "/superDashboard/api-operator/settings" },
        {
          name: "Operator Settings",
          path: "/superDashboard/api-operator/operator-settings",
        },
        {
          name: "Service Settings",
          path: "/superDashboard/api-operator/service-settings",
        },
      ],
    },
    {
      name: "Resources",
      icon: MaskGroup3,
      dropdown: true,
      children: [
        {
          name: "Schema Master",
          path: "/superDashboard/resources/schemamaster",
        },
      ],
    },
    {
      name: "Fund Manage",
      icon: MaskGroup4,
      dropdown: true,
      children: [
        // {
        //   name: "Wallet Load",
        //   path: `/superDashboard/fund-management/wallet-load`,
        // },
        {
          name: "Fund Request",
          path: `/superDashboard/fund-management/fund-request`,
        },
        // {
        //   name: "QR UPI Transcation",
        //   path: `/superDashboard/fund-management/qr-upi-transaction`,
        // },
      ],
    },
    // {
    //   name: "Reports",
    //   icon: MaskGroup5,
    //   dropdown: true,
    //   children: [
    //     { name: "Business Report", path: "/superDashboard/reports/business" },
    //     { name: "Earning Report", path: "/superDashboard/reports/earning" },
    //     {
    //       name: "N/W Overview Report",
    //       path: "/superDashboard/reports/nw-overview",
    //     },
    //     {
    //       name: "User Performance",
    //       path: "/superDashboard/reports/user-performance",
    //     },
    //   ],
    // },

    {
      name: "Txn History",
      icon: MaskGroup5,
      path: "/superDashboard/txn-history",
      dropdown: false,
    },

    {
      name: "Help",
      icon: MaskGroup3,
      dropdown: true,
      children: [
        {
          name: "Contact Support",
          path: "/superDashboard/contact-support",
        },
      ],
    },
  ];

  // Fetch admin details on component mount
  useEffect(() => {
    dispatch(getAdminDetails());
  }, [dispatch]);

  // Unauthorized handling is now done in axios interceptor
  // No need to check here - interceptor handles error, logout, and navigation

  // Update active menu based on current pathname
  useEffect(() => {
    setIsSidebarOpen(false);

    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find((item) => {
      if (item.path && currentPath === item.path) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => child.path === currentPath);
      }
      return false;
    });

    if (currentMenuItem) {
      setActiveMenu(currentMenuItem.name);
      // If it's a dropdown and a child is active, open the dropdown
      if (currentMenuItem.dropdown && currentMenuItem.children) {
        const activeChild = currentMenuItem.children.find(
          (child) => child.path === currentPath,
        );
        if (activeChild) {
          setOpenDropdown(currentMenuItem.name);
        } else {
          setOpenDropdown(null);
        }
      } else {
        setOpenDropdown(null);
      }
    }
  }, [location.pathname]);

  const handleMenuClick = (name, dropdown, path) => {
    if (dropdown) {
      // toggle dropdown open/close
      setOpenDropdown((prev) => (prev === name ? null : name));
      // also set it as active parent
      setActiveMenu(name);
      // If dropdown has a path, navigate to it
      if (path) {
        navigate(path, { replace: true });
      }
    } else {
      // close any open dropdown
      setOpenDropdown(null);
      // mark this as active
      setActiveMenu(name);
      if (path) {
        // Use replace: true to prevent intermediate navigation history
        navigate(path, { replace: true });
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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
            className="h-10 mx-auto mb-2 object-contain"
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
                    <span>{name}</span>
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
            <button className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-[0.5px] border-[#1B1717]/80 transition hover:border-[#039155]/70 text-[#1B1717]/80 ">
              <img
                src={NotificationIcon}
                alt="Notifications"
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain  "
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/img/gmaxepay.png";
                }}
              />
            </button>

            <div
              className="relative flex items-center gap-2"
              ref={profileDropdownRef}
            >
              <span className="hidden text-lg font-[Gilroy-Semibold] text-[#1B1717] sm:inline">
                {"Admin Panel"}
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
                      to="/superDashboard/profile"
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

export default DashboardLayout;
