import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listServices,
  createService,
  updateService,
} from "../../../redux/action/serviceActions";
import { ButtonLoader } from "../../../widgets/layout/loader";

// ── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_SERVICES = {
  data: [
    { id: "S001", serviceName: "Mobile Prepaid", isActive: true },
    { id: "S002", serviceName: "Electricity", isActive: true },
    { id: "S003", serviceName: "DTH", isActive: true },
    { id: "S004", serviceName: "Water", isActive: false },
    { id: "S005", serviceName: "Gas", isActive: true },
  ],
  paginator: { pageCount: 1, currentPage: 1 }
};

const ServiceSetting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    id: "",
    servicename: "",
    active: true,
  });

  const handleSubmit = () => {
    if (!formData.servicename) return;

    /*
    const payload = {
      serviceName: formData.servicename,
      isActive: formData.active,
    };

    const action =
      isEditMode && editingId
        ? updateService(editingId, payload)
        : createService(payload);

    dispatch(action).then(() => {
      setCurrentPage(1);

      dispatch(
        listServices({
          query: {},
          customSearch: searchQuery ? { serviceName: searchQuery } : {},
          options: {
            page: 1,
            paginate: 10,
          },
        }),
      );
    });
    */
    console.log("Mock Submit Service:", formData);
    alert(`Service ${isEditMode ? "updated" : "added"} successfully! (Demo Mode)`);

    setIsOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ id: "", servicename: "", active: true });
  };

  const handleEdit = (service) => {
    setIsEditMode(true);
    setEditingId(service.id);

    setFormData({
      id: service.id,
      servicename: service.serviceName,
      active: service.isActive,
    });

    setIsOpen(true);
  };

  // const handleDelete = (id) => {
  //   if (!window.confirm("Delete this service?")) return;

  //   setServices((prev) => prev.filter((service) => service.id !== id));
  // };

  const serviceListFromRedux = useSelector((state) => state.services.serviceList);
  const isLoading = false; // Force false for demo

  const serviceList = serviceListFromRedux?.data?.length > 0 ? serviceListFromRedux : DUMMY_SERVICES;

  const services = serviceList?.data || [];
  const paginator = serviceList?.paginator || {};
  const totalPages = paginator?.pageCount || 1;
  const apiCurrentPage =
    typeof paginator?.currentPage === "number"
      ? paginator.currentPage
      : currentPage;
  // useEffect(() => {
  //   dispatch(listServices(searchQuery, 1));
  // }, [dispatch, searchQuery]);

  useEffect(() => {
    /* 
    dispatch(
      listServices({
        query: {},
        customSearch: searchQuery ? { serviceName: searchQuery } : {},
        options: {
          page: currentPage,
          paginate: 10,
          sort: { createdAt: 1 },
        },
      }),
    );
    */
  }, [ searchQuery, currentPage]);

  return (
    <div className="py-4 px-1">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-[622px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Service"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
        w-full
        border border-black/50
        px-10 py-2.5
        rounded-lg
        focus:outline-none
        text-sm
      "
          />
        </div>

        {/* Add Button */}
        <div className="w-full lg:w-auto">
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingId(null);
              setFormData({ id: "", servicename: "", active: true });
              setIsOpen(true);
            }}
            className="
        w-full
        lg:w-auto
        h-[44px]
        bg-[#039155]
        hover:bg-[#027a46]
        text-white
        px-5
        rounded-lg

        text-sm
        
        font-[Gilroy-Semibold]
        flex
        items-center
        justify-center
        gap-2
        shadow-sm
        truncate

      "
          >
            <Plus className="w-4 h-4 border border-white rounded-full" />
            Add New Service
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow ">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-[#1B1717]/50 ">
              {/* <th className="py-3 px-2 text-sm font-[Gilroy-Medium]">SL No</th> */}
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-left">
                ID
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-center">
                Service Name
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-right">
                Active
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-sm text-gray-500"
                >
                  <ButtonLoader />
                </td>
              </tr>
            ) : services.length > 0 ? (
              services.map((service) => (
                <tr key={service.id} className="border-b border-[#1B1717]/20 last:border-b-0">
                  {/* <td className="py-3 px-2 text-xs font-[gilroy-">
                    {service.slno}
                  </td> */}
                  <td className="w-1/4 py-4 px-6 text-xs font-[Gilroy-Medium] text-left">
                    {service.id}
                  </td>
                  <td className="w-1/4 py-4 px-6 text-xs font-[Gilroy-Medium] text-center">
                    {service.serviceName}
                  </td>
                  <td className="w-1/4 py-4 px-6">
                    <div className="flex justify-end">
                      <button
                        // onClick={() => toggleStatus(service.id)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${service.isActive ? "bg-[#039155]" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${service.isActive ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="w-1/4 py-4 px-6">
                    <div className="flex justify-end gap-3">
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2  transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-[#039155]" />
                      </button>

                      {/* Delete
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-sm text-gray-500"
                >
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={apiCurrentPage === 1 || isLoading}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (apiCurrentPage <= 3) page = i + 1;
              else if (apiCurrentPage >= totalPages - 2)
                page = totalPages - 4 + i;
              else page = apiCurrentPage - 2 + i;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${apiCurrentPage === page
                    ? "bg-[#039155] text-white"
                    : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={apiCurrentPage === totalPages || isLoading}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white w-[498px] rounded-3xl p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-9 h-9
                         flex items-center justify-center
                         rounded-xl bg-[#039155]
                         hover:opacity-90 transition"
            >
              <span
                className="w-6 h-6 flex items-center justify-center
                           rounded-full border-2 border-white
                           text-white text-sm font-[Gilroy-Semibold]"
              >
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] text-center">
              {isEditMode ? "Edit Service" : "Add New Service"}
            </h2>

            <p className="text-base text-[#1B1717]/80 font-[Gilroy-Regular] text-center mb-6">
              {isEditMode ? "Update Service Details" : "Create A New Service"}
            </p>

            {/* Form */}
            <div className="space-y-5">
              <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-lg">
                Add Service
              </h3>

              {/* Inputs */}
              <div className="flex gap-4 items-end">
                {/* Service Name */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.servicename}
                    onChange={(e) =>
                      setFormData({ ...formData, servicename: e.target.value })
                    }
                    placeholder="Enter Service Name"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-4 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Active
                  </label>

                  <div className="border border-[#1B1717]/80 py-4 px-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
                      Activate Service
                    </span>

                    <button
                      onClick={() =>
                        setFormData({ ...formData, active: !formData.active })
                      }
                      className={`w-10 h-5 rounded-full p-1 transition-colors ${formData.active ? "bg-[#039155]" : "bg-gray-300"
                        }`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.active ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active toggle
              <div>
                <h3 className="font-[Gilroy-Medium] text-sm text-[#121216] mb-1">
                  Active
                </h3>

                <div className="w-[48%] border border-[#1B1717]/80 py-1 px-1.5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs font-[Gilroy-Medium] text-[#1B1717]">
                      Active
                    </p>
                    <span className="text-[10px] text-[#1B1717]/80 font-[Gilroy-Medium]">
                      Activate This Operator
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setFormData({ ...formData, active: !formData.active })
                    }
                    className={`w-10 h-5 rounded-full p-1 transition-colors ${
                      formData.active ? "bg-[#039155]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        formData.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div> */}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[Gilroy-Medium] rounded-xl py-3 text-sm"
              >
                Cancel
              </button>

              <button
                // onClick={() => {
                //   if (!formData.id || !formData.servicename) return;
                onClick={handleSubmit}
                // if (isEditMode) {
                //   // UPDATE
                //   setServices((prev) =>
                //     prev.map((service) =>
                //       service.id === editingId
                //         ? { ...service, ...formData }
                //         : service,
                //     ),
                //   );
                // } else {
                //   // ADD
                //   setServices((prev) => [
                //     ...prev,
                //     {
                //       slno: prev.length + 1,
                //       ...formData,
                //     },
                //   ]);
                // }

                //   setIsOpen(false);
                //   setIsEditMode(false);
                //   setEditingId(null);
                // }}
                className="w-1/2 bg-[#039155] text-white rounded-xl font-[Gilroy-Semibold] py-3 text-sm"
              >
                {isEditMode ? "Update Service" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSetting;
