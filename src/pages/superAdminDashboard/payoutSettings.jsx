import { Plus, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../widgets/layout/loader";

const PayoutSetting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = useSelector((state) => state.loading.isLoading);

  const [formData, setFormData] = useState({
    payoutName: "",
    active: true,
  });

  // Demo data — replace with redux-backed data when API is ready
  const [payouts, setPayouts] = useState([
    { id: 122310, payoutName: "Zuel Pay", isActive: true, createdAt: "24-03-2026" },
    { id: 122310, payoutName: "PayIndipro", isActive: true, createdAt: "24-03-2026" },
  ]);

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const today = formatDate(new Date());

  const filteredPayouts = payouts.filter((p) =>
    p.payoutName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.payoutName) return;

    if (isEditMode && editingId !== null) {
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === editingId && p.payoutName === editingId
            ? { ...p, payoutName: formData.payoutName, isActive: formData.active }
            : p
        )
      );
    } else {
      setPayouts((prev) => [
        ...prev,
        {
          id: Math.floor(100000 + Math.random() * 900000),
          payoutName: formData.payoutName,
          isActive: formData.active,
          createdAt: today,
        },
      ]);
    }

    setIsOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ payoutName: "", active: true });
  };

  const handleEdit = (payout) => {
    setIsEditMode(true);
    setEditingId(payout.id);
    setFormData({ payoutName: payout.payoutName, active: payout.isActive });
    setIsOpen(true);
  };

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredPayouts.length / ITEMS_PER_PAGE);
  const pagedPayouts = filteredPayouts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-4 px-1">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-[622px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Services"
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
              setFormData({ payoutName: "", active: true });
              setIsOpen(true);
            }}
            className="w-full lg:w-auto h-[44px] bg-[#039155] hover:bg-[#027a46] text-white px-5 rounded-lg text-sm font-[Gilroy-Semibold] flex items-center justify-center gap-2 shadow-sm truncate"
          >
            <Plus className="w-4 h-4 border border-white rounded-full" />
            Add New Payout
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-[#1B1717]/50">
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-left">
                ID
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-left">
                Pay-Out NAME
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-center">
                Active
              </th>
              <th className="w-1/4 py-4 px-6 text-sm font-[Gilroy-Medium] text-right">
                Created Date
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-sm text-gray-500">
                  <ButtonLoader />
                </td>
              </tr>
            ) : pagedPayouts.length > 0 ? (
              pagedPayouts.map((payout, idx) => (
                <tr key={idx} className="border-b border-[#1B1717]/20 last:border-b-0">
                  <td className="w-1/4 py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717] text-left">
                    {payout.id}
                  </td>
                  <td className="w-1/4 py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717] text-left">
                    {payout.payoutName}
                  </td>
                  <td className="w-1/4 py-4 px-6">
                    <div className="flex justify-center">
                      <button
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${payout.isActive ? "bg-[#039155]" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${payout.isActive ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="w-1/4 py-4 px-6 text-xs font-[Gilroy-Medium] text-[#1B1717] text-right">
                    {payout.createdAt}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-sm text-gray-500">
                  No payouts found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${currentPage === page
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
              disabled={currentPage === totalPages}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white w-[498px] rounded-3xl p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-white text-white text-sm font-[Gilroy-Semibold]">
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] text-center">
              {isEditMode ? "Edit Payout" : "Add New Payout"}
            </h2>
            <p className="text-base text-[#1B1717]/80 font-[Gilroy-Regular] text-center mb-6">
              {isEditMode ? "Update Payout Details" : "Create A New Pay-Out"}
            </p>

            {/* Form */}
            <div className="space-y-2">
              <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-lg">
                Add Pay-Out
              </h3>

              <div className="flex gap-4 items-end">
                {/* Payout Name */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Pay-Out Name
                  </label>
                  <input
                    type="text"
                    value={formData.payoutName}
                    onChange={(e) =>
                      setFormData({ ...formData, payoutName: e.target.value })
                    }
                    placeholder="Enter Pay-Out Name"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-5 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Active
                  </label>
                  <div className="border border-[#1B1717]/80 py-3 px-3 rounded-lg flex justify-between items-center">
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
                onClick={handleSubmit}
                className="w-1/2 bg-[#039155] text-white rounded-xl font-[Gilroy-Semibold] py-3 text-sm"
              >
                {isEditMode ? "Update Pay-Out" : "Add Pay-Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutSetting;