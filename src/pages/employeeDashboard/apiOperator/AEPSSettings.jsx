import { Plus, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { useNotification } from "../../../context/NotificationContext";
import { createAEPSAPISwitch, getAEPSAPIswitch, updateAEPSAPIswitch } from "../../../redux/action/aepsThreeAction";

const AEPSSettings = () => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const isLoading = useSelector((state) => state.loading.isLoading);
  const aepsSwitchResponse = useSelector((state) => state.aepsThree?.aeps3GetSwitch);
  
  const rawSwitches = aepsSwitchResponse?.data || [];
  const switches = Array.isArray(rawSwitches)
    ? [...rawSwitches].sort((a, b) => a.id - b.id)
    : [];

  // Paginator handling
  const paginator = aepsSwitchResponse?.paginator || {};
  const totalPages = paginator?.pageCount || 1;
  const apiCurrentPage = typeof paginator?.currentPage === "number" ? paginator.currentPage : currentPage;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    aepsType: "AEPS1",
    isActive: true,
  });

  const checkIsActive = (p) => {
    return p.isActive === true;
  };

  const fetchList = (page = currentPage) => {
    dispatch(getAEPSAPIswitch({
      query: searchQuery ? { name: searchQuery } : {},
      options: { page: page, limit: 10 }
    }));
  };

  useEffect(() => {
    fetchList();
  }, [dispatch, currentPage, searchQuery]);

  const handleSubmit = () => {
    if (!formData.name || !formData.aepsType) return;

    if (isEditMode && editingId !== null) {
      dispatch(updateAEPSAPIswitch({
        id: editingId,
        name: formData.name,
        aepsType: formData.aepsType,
        isActive: formData.isActive,
      }))
        .then((res) => {
          if (res?.status === "SUCCESS") {
            showNotification({
              type: "success",
              message: res.message || "AEPS Switch updated successfully!",
              isCritical: true,
            });
            fetchList();
          } else {
            showNotification({
              type: "error",
              message: res?.message || "Failed to update AEPS switch.",
              isCritical: true,
            });
          }
        })
        .catch(() => {
          showNotification({
            type: "error",
            message: "Something went wrong while updating AEPS switch.",
            isCritical: true,
          });
        });
    } else {
      dispatch(createAEPSAPISwitch({
        name: formData.name,
        aepsType: formData.aepsType,
        isActive: formData.isActive,
      }))
        .then((res) => {
          if (res?.status === "SUCCESS") {
            showNotification({
              type: "success",
              message: res.message || "AEPS Switch created successfully!",
              isCritical: true,
            });
            setCurrentPage(1);
            fetchList(1);
          } else {
            showNotification({
              type: "error",
              message: res?.message || "Failed to create AEPS switch.",
              isCritical: true,
            });
          }
        })
        .catch(() => {
          showNotification({
            type: "error",
            message: "Something went wrong while creating AEPS switch.",
            isCritical: true,
          });
        });
    }

    setIsOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ id: "", name: "", aepsType: "AEPS1", isActive: true });
  };

  const handleToggle = (item) => {
    dispatch(updateAEPSAPIswitch({ 
      id: item.id,
      isActive: !checkIsActive(item)
    }))
      .then((res) => {
        if (res?.status === "SUCCESS") {
          showNotification({
            type: "success",
            message: res.message || "Status updated successfully!",
            isCritical: true,
          });
          fetchList();
        } else {
          showNotification({
            type: "error",
            message: res?.message || "Failed to update status.",
            isCritical: true,
          });
        }
      })
      .catch(() => {
        showNotification({
          type: "error",
          message: "Something went wrong while updating status.",
          isCritical: true,
        });
      });
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setFormData({ 
      id: item.id, 
      name: item.name || "", 
      aepsType: item.aepsType || "AEPS1", 
      isActive: checkIsActive(item) 
    });
    setIsOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <div className="py-4 px-1">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-[622px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Providers"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-black/50 px-10 py-2.5 rounded-lg focus:outline-none text-sm"
          />
        </div>

        {/* Add Button */}
        <div className="w-full lg:w-auto">
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingId(null);
              setFormData({ id: "", name: "", aepsType: "AEPS1", isActive: true });
              setIsOpen(true);
            }}
            className="w-full lg:w-auto h-[44px] bg-[#039155] hover:bg-[#027a46] text-white px-5 rounded-lg text-sm font-[Gilroy-Semibold] flex items-center justify-center gap-2 shadow-sm truncate"
          >
            <Plus className="w-4 h-4 border border-white rounded-full" />
            Add New Switch
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-[#1B1717]/50">
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-left">ID</th>
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-left">Provider Name</th>
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-left">AEPS Type</th>
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-center">Active</th>
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-center">Edit</th>
              <th className="py-4 px-6 text-sm font-[Gilroy-Medium] text-right">Created Date</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-sm text-gray-500">
                  <ButtonLoader />
                </td>
              </tr>
            ) : switches.length > 0 ? (
              switches.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-[#1B1717]/20 last:border-b-0">
                  <td className="py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717]">{item.id}</td>
                  <td className="py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717]">{item.name}</td>
                  <td className="py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717]">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{item.aepsType}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${checkIsActive(item) ? "bg-[#039155]" : "bg-gray-300"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checkIsActive(item) ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717] text-right">{formatDate(item.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-sm text-gray-500">No switches found</td>
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
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (apiCurrentPage <= 3) page = i + 1;
              else if (apiCurrentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = apiCurrentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${apiCurrentPage === page ? "bg-[#039155] text-white" : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={apiCurrentPage === totalPages || isLoading}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white w-[550px] rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition shadow-lg">
              <span className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-white text-white text-sm font-[Gilroy-Semibold]">✕</span>
            </button>

            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] text-center mb-1">{isEditMode ? "Edit AEPS Switch" : "Add New AEPS Switch"}</h2>
            <p className="text-sm text-[#1B1717]/60 font-[Gilroy-Regular] text-center mb-8">Manage provider routing and activation status</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Provider Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">Provider Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Zuelpay"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm font-[Gilroy-Medium] focus:border-[#039155] outline-none transition-colors"
                  />
                </div>

                {/* AEPS Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">AEPS Type</label>
                  <select
                    value={formData.aepsType}
                    onChange={(e) => setFormData({ ...formData, aepsType: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm font-[Gilroy-Medium] focus:border-[#039155] outline-none transition-colors bg-white"
                  >
                    <option value="AEPS1">AEPS-1 </option>
                    <option value="AEPS2">AEPS-2 </option>
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex flex-col gap-2">
                <label className="font-[Gilroy-Medium] text-sm text-[#121216]">Status</label>
                <div className="border border-gray-200 py-4 px-5 rounded-2xl flex justify-between items-center bg-gray-50/50">
                  <div>
                    <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">Active Provider</p>
                    <span className="text-xs text-[#1B1717]/60 font-[Gilroy-Medium]">Set this as the default routing provider</span>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isActive ? "bg-[#039155]" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-10">
              <button onClick={() => setIsOpen(false)} className="w-1/2 border border-gray-300 text-gray-700 font-[Gilroy-Medium] rounded-2xl py-4 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="w-1/2 bg-[#039155] text-white rounded-2xl font-[Gilroy-Semibold] py-4 text-sm hover:bg-[#027a46] transition-all shadow-lg">
                {isEditMode ? "Update Switch" : "Create Switch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AEPSSettings;
