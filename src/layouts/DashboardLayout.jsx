import { Link, useLocation } from "react-router-dom";
import { LogOut, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { useState } from "react";

import MaskGroup from "../../public/img/Maskgroup.png";
import MaskGroup1 from "../../public/img/Maskgroup1.png";
import MaskGroup2 from "../../public/img/Maskgroup2.png";
import MaskGroup3 from "../../public/img/Maskgroup3.png";
import MaskGroup4 from "../../public/img/Maskgroup4.png";
import MaskGroup5 from "../../public/img/Maskgroup5.png";
import NotificationIcon from "../../public/img/NotificationIcon.png";

const DashboardLayout = ({ children }) => {
  const { company } = useCompany();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: MaskGroup,
      path: "/dashboard/home",
      dropdown: false,
    },
    {
      name: "Members",
      icon: MaskGroup1,
      dropdown: true,
      children: [
        { name: "Users", path: "/dashboard/members/add" },
        { name: "Agents", path: "/dashboard/members/list" },
      ],
    },
    {
      name: "API Operator",
      icon: MaskGroup2,
      dropdown: true,
      children: [
        { name: "Operator List", path: "/dashboard/api-operator/list" },
        { name: "API Settings", path: "/dashboard/api-operator/settings" },
      ],
    },
    {
      name: "Fund Manage",
      icon: MaskGroup3,
      dropdown: true,
      children: [
        { name: "Scheme Manager", path: "/dashboard/fund-manage/add" },
        {
          name: "Role Upgrade Request",
          path: "/dashboard/fund-manage/history",
        },
      ],
    },
    {
      name: "Txn History",
      icon: MaskGroup4,
      dropdown: true,
      children: [
        { name: "Transaction List", path: "/dashboard/txn-history/list" },
        { name: "Refunds", path: "/dashboard/txn-history/refunds" },
      ],
    },
    {
      name: "Reports",
      icon: MaskGroup5,
      dropdown: true,
      children: [
        { name: "Daily Reports", path: "/dashboard/reports/daily" },
        { name: "Monthly Reports", path: "/dashboard/reports/monthly" },
      ],
    },
  ];

  return (
    <div className="flex h-screen   bg-[#F5F7F8] text-[#1B1717]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#039155]/10 to-[#039155]/5 border-r flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-[#039155]/20 text-center">
          <img
            src={company.logo}
            alt="Company Logo"
            className="h-10 mx-auto mb-2"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {menuItems.map(({ name, icon, path, dropdown, children }) => {
            const isActive = location.pathname === path; // only direct routes
            const isOpen = openDropdown === name; // open dropdown state

            return (
              <div key={name}>
                {/* Main menu item */}
                <div
                  onClick={() =>
                    dropdown ? handleToggle(name) : setOpenDropdown(null)
                  }
                  className={`flex items-center justify-between gap-3 py-3 px-4 rounded-lg cursor-pointer transition font-medium ${
                    isActive || isOpen
                      ? "bg-[#039155] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#039155]/10 hover:text-[#039155]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={icon}
                      alt={name}
                      className={`w-5 h-5 ${
                        isActive || isOpen ? "filter brightness-0 invert" : ""
                      }`}
                    />
                    {dropdown ? (
                      <span>{name}</span>
                    ) : (
                      <Link to={path}>{name}</Link>
                    )}
                  </div>

                  {dropdown &&
                    (isOpen ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ))}
                </div>

                {/* Dropdown items */}
                {dropdown && isOpen && (
                  <div className=" bg-white rounded-2xl mt-2 shadow-sm py-2 px-3 space-y-1 border border-gray-100">
                    {children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`flex items-center gap-2 py-2 px-3 text-md rounded-md transition ${
                            isChildActive
                              ? "text-[#039155] font-semibold"
                              : "text-gray-700 "
                          }`}
                        >
                          {/* Side arrow icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke={isChildActive ? "#039155" : "currentColor"}
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
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border border-[#1B1717]/10 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-[#1B1717]">
              Welcome Back!
            </h1>
            <p className="text-sm text-gray-500">Rohan G</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex items-center justify-center w-14 h-14 rounded-full border border-[#1B1717]/50 transition">
              <img
                src={NotificationIcon}
                alt="Notifications"
                className="w-8 h-8"
              />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Admin Panel</span>
              <UserCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 bg-[#F9FAFB] p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
