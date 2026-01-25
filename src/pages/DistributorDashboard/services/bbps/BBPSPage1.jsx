import { useState, useEffect, useRef } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getUserBBPSCategories } from "../../../../redux/action/bbpsAction";
import { ButtonLoader } from "../../../../widgets/layout/loader";

const BBPSPage1 = ({ onNext, onBack, formData, setFormData }) => {
  const dispatch = useDispatch();
  const { userCategories, userCategoriesLoading, userCategoriesError } = useSelector(
    (state) => state.bbps
  );
  const [selectedCategory, setSelectedCategory] = useState(
    formData.category || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch categories from Redux
  useEffect(() => {
    if (userCategories.length === 0 && !userCategoriesLoading) {
      dispatch(getUserBBPSCategories(1, 6));
    }
  }, [dispatch, userCategories.length, userCategoriesLoading]);

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

  const handleProceed = () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    setFormData((prev) => ({ ...prev, category: selectedCategory }));
    setTimeout(() => {
      setIsLoading(false);
      onNext({ category: selectedCategory });
    }, 300);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
        >
          <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
        </button>
        <div className="flex-1">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            Bharat Connect Service
          </div>
          <div className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Making Connections Easier for Everyone
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
          Information
        </div>

        <div className="space-y-4">
          {/* Select Category */}
          <div>
            <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
              Select Category *
            </label>

            {userCategoriesLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-center">
                <ButtonLoader color="#039155" size={20} thickness={3} />
                <span className="ml-2 text-gray-500">Loading categories...</span>
              </div>
            ) : userCategoriesError ? (
              <div className="w-full px-4 py-3 border border-red-300 rounded-lg text-red-500 text-center">
                {userCategoriesError}
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg flex justify-between items-center hover:border-[#039155] transition"
                >
                  <span
                    className={
                      !selectedCategory ? "text-gray-400" : "text-[#1B1717]"
                    }
                  >
                    {selectedCategory
                      ? userCategories.find((c) => c.id === selectedCategory.id)
                          ?.name || selectedCategory.name
                      : "Select Category"}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {userCategories.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-center">
                        No categories available
                      </div>
                    ) : (
                      userCategories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px] font-['Gilroy-Medium'] text-[#1B1717]"
                        >
                          {category.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBack}
              className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium'] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!selectedCategory || isLoading}
              className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] disabled:bg-[#039155]/50 disabled:cursor-not-allowed text-white rounded-lg font-['Gilroy-Medium'] flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <ButtonLoader color="#FFFFFF" size={20} thickness={3} />
                  <span>Processing...</span>
                </>
              ) : (
                "Proceed"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BBPSPage1.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default BBPSPage1;
