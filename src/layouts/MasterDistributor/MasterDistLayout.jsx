import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { useCompany } from "../../context/CompanyContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/action/userProfileAction";
import { useNotification } from "../../context/NotificationContext";

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

const MasterDistLayout = ({ children }) => {
  const { company } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { email, name, unauthorized, error } = useSelector(
    (state) => state.userProfile,
  );

  // State for open dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // State for active (highlighted) main menu item
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  // State for mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Handle unauthorized token expiration - redirect to login
  useEffect(() => {
    if (unauthorized) {
      const errorMessage = error || "Invalid token. Please login again.";
      showNotification({
        message: errorMessage,
        type: "error",
        duration: 3000,
        isCritical: true, // Mark as critical so it shows on dashboard
      });
      // Redirect to login after a short delay to show notification
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 500);
    }
  }, [unauthorized, error, navigate, showNotification]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuClick = (name, dropdown, path) => {
    if (dropdown) {
      // toggle dropdown open/close
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

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const BASE_PATH = "/masterDistributerDashboard";

  const menuItems = [
    {
      name: "Dashboard",
      icon: MaskGroup,
      path: `${BASE_PATH}/home`,
      dropdown: false,
    },
    {
      name: "Members",
      icon: MaskGroup1,
      dropdown: true,
      path: `${BASE_PATH}/members`,
      children: [
        { name: "Users", path: `${BASE_PATH}/members/user` },
        { name: "Agents", path: `${BASE_PATH}/members/list` },
        {
          name: "Role Management",
          path: `${BASE_PATH}/members/rolemanagement`,
        },
      ],
    },
    {
      name: "API Operator",
      icon: MaskGroup2,
      dropdown: true,
      children: [
        { name: "Operator List", path: `${BASE_PATH}/api-operator/list` },
        { name: "API Settings", path: `${BASE_PATH}/api-operator/settings` },
      ],
    },
    {
      name: "Resources",
      icon: MaskGroup3,
      dropdown: true,
      children: [
        {
          name: "Schema Master",
          path: `${BASE_PATH}/resources/schemamaster`,
        },
        {
          name: "Role Upgrade",
          path: `${BASE_PATH}/resources/roleupgraderequest`,
        },
      ],
    },
    {
      name: "Fund Manage",
      icon: MaskGroup4,
      dropdown: true,
      children: [
        {
          name: "Wallet Load",
          path: `${BASE_PATH}/fund-management/wallet-load`,
        },
        {
          name: "Fund Request",
          path: `${BASE_PATH}/fund-management/fund-request`,
        },
        {
          name: "QR UPI Transcation",
          path: `${BASE_PATH}/fund-management/qr-upi-transaction`,
        },
      ],
    },
    {
      name: "Reports",
      icon: MaskGroup5,
      dropdown: true,
      children: [
        { name: "Business Report", path: `${BASE_PATH}/reports/business` },
        { name: "Earning Report", path: `${BASE_PATH}/reports/earning` },
        {
          name: "N/W Overview Report",
          path: `${BASE_PATH}/reports/nw-overview`,
        },
        {
          name: "User Performance",
          path: `${BASE_PATH}/reports/user-performance`,
        },
      ],
    },
    {
      name: "Txn History",
      icon: MaskGroup5,
      path: `${BASE_PATH}/tax-history`,
      dropdown: false,
    },
  ];

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
        className={`fixed inset-y-0 left-0 z-30 w-[260px] max-w-[85%] bg-white lg:bg-[#0391550D] flex flex-col shadow-2xl rounded-r-xl transform transition-transform duration-300 lg:w-[277px] lg:translate-x-0 lg:shadow-lg lg:rounded-r-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                  className={`flex items-center justify-between gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 font-medium ${
                    isActiveParent
                      ? "bg-[#039155] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#039155]/10 hover:text-[#039155]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={icon}
                      alt={name}
                      className={`w-5 h-5 object-contain ${
                        isActiveParent ? "filter brightness-0 invert" : ""
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
                            className={`flex items-center gap-2 py-2 px-3 text-md rounded-md transition-all duration-200 ${
                              isChildPathActive
                                ? "text-[#039155] font-semibold"
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
        <header className="sticky top-4 mx-11 rounded-xl bg-white px-4 sm:px-4 lg:px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0 z-20 shadow">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md text-[#1B1717] focus:outline-none lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-[gilroy-semibold] text-[#1B1717]">
                Welcome Back!
              </h1>
              <p className="text-base font-[gilroy-medium] text-[#1B1717]">
                {name || email || "Admin"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full border-[0.5px] border-[#1B1717]/80 transition hover:border-[#039155]/70 text-[#1B1717]/80 ">
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

            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium sm:inline">
                {name || email || "Master Distributer Panel"}
              </span>
              <img
                src={defaultProfileImage}
                alt="Profile"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = companyLogo;
                }}
              />
            </div>
          </div>

          {/* Rounded bottom border line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-[1px] bg-[#1B1717]/80 "></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full p-2 sm:p-4 bg-[#FAFAFA] lg:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MasterDistLayout;
