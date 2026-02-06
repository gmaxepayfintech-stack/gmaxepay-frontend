import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listServices,
  createService,
  updateService,
} from "../../redux/action/serviceActions";
import { ButtonLoader } from "../../widgets/layout/loader";

const ServiceSetting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    servicename: "",
    active: true,
  });

  const handleSubmit = () => {
    if (!formData.servicename) return;

    const payload = {
      serviceName: formData.servicename,
      isActive: formData.active,
    };

    if (isEditMode && editingId) {
      // 🔁 UPDATE
      dispatch(updateService(editingId, payload));
    } else {
      // ➕ CREATE
      dispatch(createService(payload));
    }

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

  const dispatch = useDispatch();
  const { serviceList } = useSelector((state) => state.services);
  const isLoading = useSelector((state) => state.loading.isLoading);
  const services = serviceList || [];

  useEffect(() => {
    dispatch(listServices(searchQuery, 1));
  }, [dispatch, searchQuery]);

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
        
        font-[gilroy-semibold]
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
              {/* <th className="py-3 px-2 text-sm font-[gilroy-medium]">SL No</th> */}
              <th className="w-1/4 py-4 px-6 text-sm font-[gilroy-medium] text-left">
                ID
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[gilroy-medium] text-center">
                Service Name
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[gilroy-medium] text-right">
                Active
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[gilroy-medium] text-right">
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
                <tr
                  key={service.id}
                  className="border-b border-[#1B1717]/20 last:border-none"
                >
                  {/* <td className="py-3 px-2 text-xs font-[gilroy-">
                    {service.slno}
                  </td> */}
                  <td className="w-1/4 py-4 px-6 text-xs font-[gilroy-medium] text-left">
                    {service.id}
                  </td>
                  <td className="w-1/4 py-4 px-6 text-xs font-[gilroy-medium] text-center">
                    {service.serviceName}
                  </td>
                  <td className="w-1/4 py-4 px-6">
                    <div className="flex justify-end">
                      <button
                        // onClick={() => toggleStatus(service.id)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          service.isActive ? "bg-[#039155]" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            service.isActive ? "translate-x-6" : "translate-x-0"
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
                           text-white text-sm font-bold"
              >
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[gilroy-medium] text-[#1B1717] text-center">
              {isEditMode ? "Edit Service" : "Add New Service"}
            </h2>

            <p className="text-base text-[#1B1717]/80 font-[gilroy-regular] text-center mb-6">
              {isEditMode ? "Update Service Details" : "Create A New Service"}
            </p>

            {/* Form */}
            <div className="space-y-5">
              <h3 className="font-[gilroy-semibold] text-[#1B1717] text-lg">
                Add Service
              </h3>

              {/* Inputs */}
              <div className="flex gap-4 items-end">
                {/* Service Name */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.servicename}
                    onChange={(e) =>
                      setFormData({ ...formData, servicename: e.target.value })
                    }
                    placeholder="Enter Service Name"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-4 text-sm font-[gilroy-medium]"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Active
                  </label>

                  <div className="border border-[#1B1717]/80 py-4 px-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-[gilroy-medium] text-[#1B1717]">
                      Activate Service
                    </span>

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
                </div>
              </div>

              {/* Active toggle
              <div>
                <h3 className="font-[gilroy-medium] text-sm text-[#121216] mb-1">
                  Active
                </h3>

                <div className="w-[48%] border border-[#1B1717]/80 py-1 px-1.5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs font-[gilroy-medium] text-[#1B1717]">
                      Active
                    </p>
                    <span className="text-[10px] text-[#1B1717]/80 font-[gilroy-medium]">
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
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[gilroy-medium] rounded-xl py-3 text-sm"
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
                className="w-1/2 bg-[#039155] text-white rounded-xl font-[gilroy-semibold] py-3 text-sm"
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
