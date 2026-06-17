import { Search, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

const PlanSearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  activeCategory,
  setActiveCategory,
  getFilterButtons,
  getFilterValue,
  getCategoryTabs,
  displayDetailedPlans,
  setSelectedPlanForRecharge,
  setSelectedPlan,
  setShowDetailsModal,
}) => {
  return (
    <div className="bg-white border border-gray-200  rounded-xl p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative font-['Gilroy-Medium']">
        <Search className="absolute left-4 top-1/2 text-[#1B1717] text-opacity-50 -translate-y-1/2  w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search For A Plan, Eg 249 Or 28 Days"
          className="w-full pl-12 pr-4 py-3    text-opacity-80 border-[0.5px] rounded-xl focus:outline-none text-[#1B1717]"
        />
      </div>

      {/* Filter Buttons */}
      {getFilterButtons().length > 0 && (
        <div className="flex flex-wrap gap-[17px]">
          {getFilterButtons().map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                // Populate search bar with display text (filter), but actual filtering uses transformed value
                setSearchQuery(filter);
                setActiveFilter(null);
              }}
              className={`px-4 py-2 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${
                activeFilter === filter
                  ? "bg-[#039155] text-white"
                  : "bg-gray-100 text-[#1B1717] hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      {getCategoryTabs().length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 mt-4 mb-4 font-['Gilroy-SemiBold'] border-gray-200 w-full scrollbar-none">
          {getCategoryTabs().map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                // For "Recommended", always set it (don't toggle)
                if (category === "Recommended") {
                  setActiveCategory("Recommended");
                } else {
                  // For other categories, toggle
                  setActiveCategory(
                    activeCategory === category ? "Recommended" : category,
                  );
                }
                setActiveFilter(null); // Reset filter when category changes
              }}
              className={`text-[14px] font-['Gilroy-Medium'] whitespace-nowrap flex-shrink-0 pb-2 transition relative ${
                activeCategory === category
                  ? "text-[#039155]"
                  : "text-gray-600 hover:text-[#1B1717]"
              }`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[3px] bg-[#039155]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detailed Plan Cards - Scrollable Container */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {displayDetailedPlans.length > 0 ? (
          displayDetailedPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanForRecharge(plan)}
              className="bg-white border border-[#1B1717] border-opacity-80 border-[0.5px] rounded-xl p-3 hover:shadow-sm transition cursor-pointer"
            >
              {/* Top Section */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1B1717] border-opacity-80 ">
                {/* Price */}
                <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] flex-shrink-0">
                  {plan.price}
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-[1px] mx-4 bg-[#1B1717] bg-opacity-80 flex-shrink-0" />

                {/* Validity and Data */}
                <div className="flex-1 flex gap-4 flex-shrink-0">
                  <div className="flex-shrink-0" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div
                      className="text-[11px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-0.5"
                      style={{ margin: 0, padding: 0, textAlign: "left" }}
                    >
                      Plan Validity
                    </div>
                    <div
                      className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]"
                      style={{ margin: 0, padding: 0, textAlign: "left" }}
                    >
                      {plan.validity}
                    </div>
                  </div>
                  <div className="flex-shrink-0" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div
                      className="text-[11px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-0.5"
                      style={{ margin: 0, padding: 0, textAlign: "left" }}
                    >
                      Plan Data
                    </div>
                    <div
                      className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]"
                      style={{ margin: 0, padding: 0, textAlign: "left" }}
                    >
                      {plan.data}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <ChevronRight className="text-[#1B1717] text-opacity-80 w-4 h-4" />
              </div>

              {/* Bottom Section */}
              <div className="pt-2 space-y-0.5">
                <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                  Calls : {plan.calls}
                </div>
                <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 flex items-center justify-between">
                  <span>
                    Validity : {plan.validityExtra || plan.desc || "N/A"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                      setShowDetailsModal(true);
                    }}
                    className="text-[12px] font-['Gilroy-Medium'] underline text-[#1B1717] cursor-pointer hover:underline"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-[#1B1717] text-opacity-60">
            No plans found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

PlanSearchAndFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  activeFilter: PropTypes.string,
  setActiveFilter: PropTypes.func.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  getFilterButtons: PropTypes.func.isRequired,
  getFilterValue: PropTypes.func.isRequired,
  getCategoryTabs: PropTypes.func.isRequired,
  displayDetailedPlans: PropTypes.array.isRequired,
  setSelectedPlanForRecharge: PropTypes.func.isRequired,
  setSelectedPlan: PropTypes.func.isRequired,
  setShowDetailsModal: PropTypes.func.isRequired,
};

export default PlanSearchAndFilters;
