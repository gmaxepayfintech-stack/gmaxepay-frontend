import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getUserBBPSBillerInfo, getUserBBPSFetchBill } from "../../../redux/action/bbpsAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { HiArrowLeft } from "react-icons/hi2";

const BBPSPage3 = ({ onNext, onBack, formData, setFormData }) => {
  const dispatch = useDispatch();
  const { userBillerInfo, userBillerInfoLoading } = useSelector((state) => state.bbps);
  const { userFetchBill, userFetchBillLoading } = useSelector((state) => state.bbps);
  
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || "");
  const [inputParams, setInputParams] = useState(formData.inputParams || {});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch biller info when component mounts if biller is selected
  useEffect(() => {
    if (formData.biller?.billerId && !userBillerInfo?.biller?.[0]) {
      dispatch(getUserBBPSBillerInfo(formData.biller.billerId));
    }
  }, [dispatch, formData.biller?.billerId]);

  const handleFetchBill = async () => {
    if (!mobileNumber || mobileNumber.length !== 10 || !formData.biller?.billerId) return;
    
    setIsLoading(true);
    
    // Build input params from userBillerInfo
    const inputParamsList = userBillerInfo?.biller?.[0]?.billerInputParams?.[0]?.paramsList || [];
    const inputArray = inputParamsList.map((param) => ({
      paramName: param.paramName,
      paramValue: inputParams[param.paramName] || "",
    }));

    const fetchBillPayload = {
      operatorService: formData.category?.name || "",
      customerInfo: { customerMobile: mobileNumber },
      billerId: formData.biller.billerId,
      billerAdhoc: userBillerInfo?.biller?.[0]?.billerAdhoc || "false",
      inputParams: {
        input: inputArray,
      },
    };

    const result = await dispatch(getUserBBPSFetchBill(fetchBillPayload));
    if (result?.status === 'SUCCESS') {
      setFormData((prev) => ({
        ...prev,
        mobileNumber: mobileNumber.trim(),
        inputParams: inputParams,
        billDetails: result.data,
        amount: result.data?.billDetails?.billAmount || "",
      }));
      setIsLoading(false);
      onNext({
        mobileNumber: mobileNumber.trim(),
        inputParams: inputParams,
        billDetails: result.data,
        amount: result.data?.billDetails?.billAmount || "",
      });
    } else {
      setIsLoading(false);
    }
  };

  const selectedCategoryName =
    formData.category?.name || formData.category || "Selected Category";

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
          <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
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
        <div className="space-y-6">
          {/* Category and Biller Info */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div>
              <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
                {selectedCategoryName}
              </div>
              <div className="text-[14px] text-gray-500 mt-1">
                {formData.biller?.name || formData.billerName || "Biller Name"}
              </div>
            </div>
            <span className="text-[12px] bg-[#039155] text-white px-3 py-1 rounded-full font-['Gilroy-Medium']">
              Service
            </span>
          </div>

          {/* Customer Information */}
          <div>
            <p className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717] mb-4">
              Customer Information
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setMobileNumber(val);
                  }}
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#039155] transition"
                />
                {mobileNumber && mobileNumber.length !== 10 && (
                  <p className="text-[12px] text-red-500 mt-1">
                    Please enter a valid 10-digit mobile number
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Information - Dynamic Input Fields */}
          {userBillerInfoLoading ? (
            <div className="flex items-center justify-center py-4">
              <ButtonLoader color="#039155" size={20} thickness={3} />
              <span className="ml-2 text-gray-500">Loading biller info...</span>
            </div>
          ) : (
            userBillerInfo?.biller?.[0]?.billerInputParams?.[0]?.paramsList && (
              <div>
                <p className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717] mb-4">
                  Service Information
                </p>
                <div className="space-y-4">
                  {userBillerInfo.biller[0].billerInputParams[0].paramsList.map((param) => (
                    <div key={param.paramName}>
                      <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                        {param.paramName} {param.isOptional === "false" ? "*" : ""}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${param.paramName}`}
                        value={inputParams[param.paramName] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Apply data type validation
                          if (param.dataType === "NUMERIC") {
                            if (/^\d*$/.test(val)) {
                              setInputParams({ ...inputParams, [param.paramName]: val });
                            }
                          } else if (param.dataType === "ALPHANUMERIC") {
                            if (/^[A-Za-z0-9]*$/.test(val)) {
                              setInputParams({ ...inputParams, [param.paramName]: val });
                            }
                          } else {
                            setInputParams({ ...inputParams, [param.paramName]: val });
                          }
                        }}
                        maxLength={param.maxLength || undefined}
                        minLength={param.minLength || undefined}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#039155] transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium'] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleFetchBill}
              disabled={
                !mobileNumber.trim() ||
                mobileNumber.length !== 10 ||
                isLoading ||
                userFetchBillLoading ||
                !formData.biller?.billerId
              }
              className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] disabled:bg-[#039155]/50 disabled:cursor-not-allowed text-white rounded-lg font-['Gilroy-Medium'] flex items-center justify-center gap-2 transition"
            >
              {(isLoading || userFetchBillLoading) ? (
                <>
                  <ButtonLoader color="#FFFFFF" size={20} thickness={3} />
                  <span>Fetching...</span>
                </>
              ) : (
                "Fetch"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BBPSPage3.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default BBPSPage3;
