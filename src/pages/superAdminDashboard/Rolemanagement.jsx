import React, { useState, useEffect, useRef } from "react";
import { User, Users, ChevronDown } from "lucide-react";
import {
  getPermission,
  updateRolesPermission,
} from "../../redux/action/userProfileAction";
import { useDispatch, useSelector } from "react-redux";

// Role name to ID mapping
const roleMapping = {
  Admin: 1,
  "White Label": 2,
  "Master Distributor": 3,
  Distributor: 4,
  Retailer: 5,
};

const roles = [
  "Admin",
  "White Label",
  "Master Distributor",
  "Distributor",
  "Retailer",
];

// Format helper function - converts "ROLE_MANAGEMENT" to "Role Management" or "MEMBERS" to "Members"
const formatName = (name) => {
  if (!name) return "";
  // If name contains underscores, split and format each word
  if (name.includes("_")) {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  // If name is all uppercase, convert to title case
  if (name === name.toUpperCase()) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  // Otherwise return as is
  return name;
};

// Transform API data: Parent modules become modules, children become permissions
const transformModulesFromAPI = (data) => {
  if (!data || typeof data !== "object") {
    return [];
  }

  return Object.values(data).map((parentItem) => {
    const children = parentItem?.children || [];

    // Count read and write permissions from children
    const readCount = children.filter((child) => child?.read === true).length;
    const writeCount = children.filter((child) => child?.write === true).length;

    // Transform children to permissions format
    // Children moduleName becomes permissions.category
    const permissions = children.map((child) => {
      const childModuleName = child?.moduleName || "Permission";
      const formattedName = formatName(childModuleName);

      return {
        category: formattedName || childModuleName,
        description: `${formattedName || childModuleName} Access`,
        read: child?.read || false,
        write: child?.write || false,
        id: child?.id,
        permissionId: child?.permissionId,
        parentId: child?.parentId,
        roleId: parentItem?.roleId || null,
      };
    });

    // Use parent moduleName for modules.name (formatted for display)
    const parentModuleName = parentItem?.moduleName || "Module";
    const formattedParentName = formatName(parentModuleName);

    return {
      name: formattedParentName || parentModuleName,
      readCount: readCount,
      writeCount: writeCount,
      permissions: permissions,
      id: parentItem?.id,
      roleId: parentItem?.roleId,
      permissionId: parentItem?.permissionId,
      read: parentItem?.read || false,
      write: parentItem?.write || false,
      isParent: parentItem?.isParent,
    };
  });
};

const Rolemanagement = () => {
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Get the role ID from the mapping
    const roleId = roleMapping[selectedRole];
    if (roleId) {
      dispatch(getPermission(roleId));
    }
  }, [selectedRole, dispatch]);

  const roledata = useSelector(
    (state) => state?.userProfile?.adminRolesPermission?.adminRolesPermission,
  );
  const updateRolesState = useSelector(
    (state) => state?.userProfile?.updateRoles,
  );

  // Extract all parent module names from all indexes
  const Modulenames = roledata
    ? Object.values(roledata)
        .map((item) => item?.moduleName)
        .filter(Boolean)
    : [];

  // Extract parent read/write values
  const ParentReadWrite = roledata
    ? Object.values(roledata).map((item) => ({
        moduleName: item?.moduleName,
        read: item?.read || false,
        write: item?.write || false,
      }))
    : [];

  // Extract children read/write values
  const ChildrenReadWrite = roledata
    ? Object.values(roledata).flatMap((item) =>
        (item?.children || []).map((child) => ({
          moduleName: child?.moduleName,
          read: child?.read || false,
          write: child?.write || false,
        })),
      )
    : [];

  const [modules, setModules] = useState([]);

  // Update modules when roledata changes
  useEffect(() => {
    if (roledata && Object.keys(roledata).length > 0) {
      const transformedModules = transformModulesFromAPI(roledata);
      setModules(transformedModules);
    } else {
      setModules([]);
    }
  }, [roledata]);

  // When updateRolesPermission succeeds, refetch permissions for current role
  useEffect(() => {
    const status = updateRolesState?.status || updateRolesState?.message;
    if (status === "SUCCESS") {
      const roleId = roleMapping[selectedRole];
      if (roleId) {
        dispatch(getPermission(roleId));
      }
    }
  }, [updateRolesState, selectedRole, dispatch]);

  return (
    <div className="min-h-screen px-1 py-4 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-[24px] font-['Gilroy-Medium'] text-[#000000] mb-2">
          Roles Management
        </h1>
        <p className="text-[16px] font-['Gilroy-Regular'] text-[#000000]">
          Manage User Roles And Permissions Across Your System
        </p>
      </div>

      {/* Admin Role Section */}
      <div className="bg-[#FFFFFF] rounded-xl p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Admin Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full  flex items-center justify-center bg-green-100">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>

            {/* Admin Info */}
            <div>
              <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#000000] mb-[12px]">
                Admin
              </h2>
              <p className="text-sm sm:text-base font-['Gilroy-Regular'] text-[#000000]">
                Administrative Access To Core Features
              </p>
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-[#1B1717] font-[Gilroy-Medium] hover:bg-gray-100 transition"
            >
              <span>{selectedRole}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                        selectedRole === role ? "bg-gray-100 font-[Gilroy-Medium]" : ""
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Section Container */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {/* Permission Header */}
        <div className="mb-6">
          <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#000000] mb-2">
            Permission
          </h2>
          <p className="text-[16px] text-[#000000] font-['Gilroy-Regular']">
            Configure What This Role Can Access And Modify
          </p>
        </div>

        {/* Module Legend Section */}
        <div className="bg-gray-50 p-4 sm:p-6 mb-4 -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
          <span className="text-[16px] font-['Gilroy-Medium'] text-[#000000] block mb-[8px]">
            Module
          </span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[12px] text-[#000000] font-['Gilroy-Medium']">
                Read
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-[12px] text-[#000000] font-['Gilroy-Medium']">
                Write
              </span>
            </div>
          </div>
        </div>

        {/* Modules List Container */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={index}>
                {/* Module Card - Always Visible */}
                <div
                  onClick={() =>
                    setExpandedModule(expandedModule === index ? null : index)
                  }
                  className="flex items-center gap-4 p-4 rounded-xl bg-white transition-colors shadow-sm cursor-pointer"
                >
                  {/* Module Icon */}
                  <img
                    src="/img/Member.svg"
                    className="w-12 h-12  text-purple-600"
                  />

                  {/* Module Info */}
                  <div className="flex-1">
                    <h3 className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                      {module.name}
                    </h3>
                    <div className="flex items-center gap-6 text-[10px]">
                      {/* Read Permission */}
                      <div className="flex items-center gap-2">
                        <span className="text-[#4F7EF4] font-['Gilroy-SemiBold']">
                          {module.readCount}/{module.permissions.length || 0}{" "}
                          Read
                        </span>
                      </div>
                      {/* Write Permission */}
                      <div className="flex items-center gap-2">
                        <span className="text-[#039155] font-['Gilroy-SemiBold']">
                          {module.writeCount}/{module.permissions.length || 0}{" "}
                          Write
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Down Arrow (when collapsed) or Toggle Buttons (when expanded) */}
                  <div className="flex-shrink-0">
                    {expandedModule === index ? (
                      // Toggle Buttons for Read and Write (when expanded)
                      <div className="flex items-center gap-4">
                        {/* Read Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedModules = [...modules];
                            const current = updatedModules[index];
                            const newRead = !current.read;

                            // Update local state
                            current.read = newRead;
                            setModules(updatedModules);

                            // Call API to update parent permission
                            if (current.roleId && current.permissionId) {
                              dispatch(
                                updateRolesPermission({
                                  roleId: current.roleId,
                                  permissionId: current.permissionId,
                                  read: newRead,
                                  write: current.write,
                                }),
                              );
                            }
                          }}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none  focus:ring-blue-500 "
                          style={{
                            backgroundColor: module.read
                              ? "#3b82f6"
                              : "#d1d5db",
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              module.read ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-sm font-[Gilroy-Medium] text-blue-500">
                          Read
                        </span>

                        {/* Write Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedModules = [...modules];
                            const current = updatedModules[index];
                            const newWrite = !current.write;

                            // Update local state
                            current.write = newWrite;
                            setModules(updatedModules);

                            // Call API to update parent permission
                            if (current.roleId && current.permissionId) {
                              dispatch(
                                updateRolesPermission({
                                  roleId: current.roleId,
                                  permissionId: current.permissionId,
                                  read: current.read,
                                  write: newWrite,
                                }),
                              );
                            }
                          }}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none "
                          style={{
                            backgroundColor: module.write
                              ? "#10b981"
                              : "#d1d5db",
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              module.write ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-sm font-[Gilroy-Medium] text-green-500">
                          Write
                        </span>
                      </div>
                    ) : (
                      // Down Arrow (when collapsed)
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Permission Details - Shows Below Parent Card */}
                {expandedModule === index && (
                  <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
                    {/* Permission Categories */}
                    <div className="mb-6">
                      {module.permissions.map((permission, permIndex) => (
                        <div key={permIndex}>
                          <div className="flex items-center justify-between p-4 bg-white">
                            <div className="flex-1">
                              <h4 className="text-[16px] font-['Gilroy-Medium'] text-[#000000] mb-1">
                                {permission.category}
                              </h4>
                              <p className="text-[12px] text-[#000000] font-['Gilroy-Medium'] ">
                                {permission.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              {/* Read Toggle */}
                              <div className="flex items-center gap-[2px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedModules = [...modules];
                                    const perm =
                                      updatedModules[index].permissions[
                                        permIndex
                                      ];
                                    const newRead = !perm.read;

                                    // Update local state
                                    perm.read = newRead;
                                    updatedModules[index].readCount =
                                      updatedModules[index].permissions.filter(
                                        (p) => p.read,
                                      ).length;
                                    setModules(updatedModules);

                                    // Call API to update child permission
                                    const roleId =
                                      perm.roleId ||
                                      updatedModules[index].roleId;
                                    if (roleId && perm.permissionId) {
                                      dispatch(
                                        updateRolesPermission({
                                          roleId,
                                          permissionId: perm.permissionId,
                                          read: newRead,
                                          write: perm.write,
                                        }),
                                      );
                                    }
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors  ${
                                    permission.read
                                      ? "bg-blue-500 focus:ring-blue-500"
                                      : "bg-gray-300 focus:ring-gray-400"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      permission.read
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span className="text-[16px] text-[#000000] font-['Gilroy-Medium']">
                                  Read
                                </span>
                              </div>
                              {/* Write Toggle */}
                              <div className="flex items-center gap-[2px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedModules = [...modules];
                                    const perm =
                                      updatedModules[index].permissions[
                                        permIndex
                                      ];
                                    const newWrite = !perm.write;

                                    // Update local state
                                    perm.write = newWrite;
                                    // Recalculate write count
                                    updatedModules[index].writeCount =
                                      updatedModules[index].permissions.filter(
                                        (p) => p.write,
                                      ).length;
                                    setModules(updatedModules);

                                    // Call API to update child permission
                                    const roleId =
                                      perm.roleId ||
                                      updatedModules[index].roleId;
                                    if (roleId && perm.permissionId) {
                                      dispatch(
                                        updateRolesPermission({
                                          roleId,
                                          permissionId: perm.permissionId,
                                          read: perm.read,
                                          write: newWrite,
                                        }),
                                      );
                                    }
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    permission.write
                                      ? "bg-green-500"
                                      : "bg-gray-300 "
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      permission.write
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span className="text-[16px] text-[#000000] font-['Gilroy-Medium']">
                                  Write
                                </span>
                              </div>
                            </div>
                          </div>
                          {permIndex < module.permissions.length - 1 && (
                            <div className="border-b border-gray-200"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Status Message */}
                    <div className="text-[12px] text-[#1B1717] font-['Gilroy-Medium'] text-opacity-80 pt-4 border-t border-gray-200">
                      Changes Are Automatically Saved • Last Updated: Just Now
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rolemanagement;
