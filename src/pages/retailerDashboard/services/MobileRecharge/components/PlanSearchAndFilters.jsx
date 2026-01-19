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
          className="w-full pl-12 pr-4 py-3 border text-[#1B1717] text-opacity-80 border-[0.5px] rounded-xl focus:outline-none text-[#1B1717]"
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
                // Populate search bar with filter text and make button inactive
                setSearchQuery(filter);
                setActiveFilter(null);
              }}
              className={`px-4 py-2 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${activeFilter === filter
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
        <div className="flex gap-4 overflow-x-auto pb-2 mt-[40px] mb-[40px] font-['Gilroy-SemiBold'] border-gray-200 w-fit">
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
                  setActiveCategory(activeCategory === category ? "Recommended" : category);
                }
                setActiveFilter(null); // Reset filter when category changes
              }}
              className={`text-[14px] font-['Gilroy-Medium'] whitespace-nowrap pb-2 transition relative ${activeCategory === category
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
      <div className="space-y-4 gap-[18px] max-h-[600px] overflow-y-auto pr-2">
        {displayDetailedPlans.length > 0 ? (
          displayDetailedPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanForRecharge(plan)}
              className="bg-white border border-[#1B1717] border-opacity-80 border-[0.5px] rounded-xl p-4 hover:shadow-sm transition cursor-pointer"
            >
              {/* Top Section */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1B1717] border-opacity-80 ">
                {/* Price */}
                <div className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                  {plan.price}
                </div>

                {/* Vertical Divider */}
                <div className="h-12 w-[1px]  mx-6 bg-[#1B1717] bg-opacity-80" />

                {/* Validity and Data */}
                <div className="flex-1 flex gap-6">
                  <div>
                    <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                      Validity
                    </div>
                    <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]">
                      {plan.validity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                      Data
                    </div>
                    <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]">
                      {plan.data}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <ChevronRight className="text-[#1B1717] text-opacity-80 w-5 h-5" />
              </div>

              {/* Bottom Section */}
              <div className="pt-3 space-y-1">
                <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                  Calls : {plan.calls}
                </div>
                <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 flex items-center justify-between">
                  <span>Validity : {plan.validityExtra || plan.desc || "N/A"}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                      setShowDetailsModal(true);
                    }}
                    className="text-[14px] font-['Gilroy-Medium'] underline text-[#1B1717] cursor-pointer hover:underline"
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
  getCategoryTabs: PropTypes.func.isRequired,
  displayDetailedPlans: PropTypes.array.isRequired,
  setSelectedPlanForRecharge: PropTypes.func.isRequired,
  setSelectedPlan: PropTypes.func.isRequired,
  setShowDetailsModal: PropTypes.func.isRequired,
};

export default PlanSearchAndFilters;

