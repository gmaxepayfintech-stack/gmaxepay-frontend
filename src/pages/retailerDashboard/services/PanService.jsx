import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiArrowLeft } from "react-icons/hi2";
import { useNotification } from "../../../context/NotificationContext";
import { PanRequest } from "../../../redux/action/fundAction";
import { recentHistory } from "../../../redux/action/rechargeAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import PropTypes from "prop-types";

// Card Component for Recent History
const RecentPanRequestCard = ({ request }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-blue-50 rounded-full text-blue-600 font-bold text-sm">
          PAN
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
            {request.operatorType}
          </div>
          <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mt-1">
            {request.mobileNumber}
          </div>
          {request.transactionId && (
            <div className="text-[10px] text-gray-400 mt-1 truncate font-['Gilroy-Medium']">
              Txn ID: {request.transactionId}
            </div>
          )}
          <div className="text-[12px] font-['Gilroy-Regular'] text-gray-500 mt-1">
            {request.lastRecharge}
          </div>
          {request.status && (
            <div className={`text-[10px] mt-1 font-medium ${request.status.toLowerCase() === 'success' ? 'text-green-600' :
              request.status.toLowerCase() === 'failure' ? 'text-red-600' : 'text-yellow-600'
              }`}>
              {request.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecentPanRequestCard.propTypes = {
  request: PropTypes.object.isRequired,
};

const PanService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { recentHistory: recentHistoryData } = useSelector((state) => state.recharge);

  const [mobileNumber, setMobileNumber] = useState("");
  const [action, setAction] = useState("correction"); // 'new' or 'correction'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);

  // Fetch Recent History
  useEffect(() => {
    const fetchRecentHistory = async () => {
      const payload = {
        query: {
          serviceType: "Pan1",
        },
        customSearch: {},
        options: {
          page: 1,
          paginate: 10,
          sort: {
            id: -1,
          },
        },
      };

      try {
        await dispatch(recentHistory(payload));
      } catch (error) {
        console.error("Error fetching recent history:", error);
      }
    };

    fetchRecentHistory();
  }, [dispatch]);

  // Process Recent History Data
  useEffect(() => {
    const historyList = recentHistoryData?.data || recentHistoryData?.recentHistory || [];

    if (Array.isArray(historyList) && historyList.length > 0) {
      const mappedHistory = historyList.map((item) => {
        const date = new Date(item.createdAt || Date.now());
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Determine action type
        let type = "PAN Service";
        if (item.action) {
          type = item.action === "new" ? "PAN Creation" :
            item.action === "correction" ? "PAN Correction" : item.action;
        } else if (item.opcode) {
          type = item.opcode === "PAN_NEW" ? "PAN Creation" :
            item.opcode === "PAN_CR" ? "PAN Correction" : "PAN Service";
        }

        return {
          id: item._id || item.transactionId || Math.random(),
          operatorType: type,
          mobileNumber: item.mobileNumber || item.number || "",
          lastRecharge: `Request on ${formattedDate}`,
          status: item.status || "Pending",
          amount: item.amount,
          transactionId: item.transactionId
        };
      });
      setRecentRequests(mappedHistory);
    }
  }, [recentHistoryData]);


  const validateMobileNumber = (number) => {
    if (!number) {
      return "Mobile number is required";
    }
    if (number.length !== 10) {
      return "Mobile number must be 10 digits";
    }
    if (!/^\d+$/.test(number)) {
      return "Mobile number must contain only digits";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number
    const mobileError = validateMobileNumber(mobileNumber);
    if (mobileError) {
      setErrors({ mobileNumber: mobileError });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        action: action, // 'new' or 'correction'
        mobile_number: mobileNumber,
      };

      // Make API call using PanRequest action
      const response = await dispatch(PanRequest(payload));

      // Get the response status and data
      const responseStatus = response?.status;
      const panData = response?.panServiceRequest;

      // Check if outer status is FAILURE
      if (responseStatus === "FAILURE") {
        // Show failure message from data or response
        const errorMessage =
          panData?.message ||
          response?.message ||
          "Failed to submit PAN request";
        showNotification({
          type: "error",
          message: errorMessage,
          isCritical: true,
        });
      } else if (panData?.url && panData?.status === "Success") {
        // Open URL in a new tab
        window.open(panData.url, "_blank", "noopener,noreferrer");
        // Optionally refresh history
        dispatch(recentHistory({ query: { serviceType: "Pan1" }, options: { page: 1, limit: 10, sort: { id: -1 } } }));
      } else if (panData?.status === "Failure") {
        // Show failure message from inner data
        const errorMessage =
          panData?.message ||
          panData?.opid ||
          response?.message ||
          "Failed to submit PAN request";
        showNotification({
          type: "error",
          message: errorMessage,
        });
      } else {
        // Fallback: check if URL exists even if status check fails
        if (panData?.url) {
          // Open URL in a new tab
          window.open(panData.url, "_blank", "noopener,noreferrer");
        } else {
          // Show error if no URL and no clear status
          const errorMessage =
            panData?.message ||
            response?.message ||
            "Failed to submit PAN request";
          showNotification({
            type: "error",
            message: errorMessage,
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit PAN correction request";
      showNotification({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/retailerDashboard/services");
  };

  return (
    <div className="w-full py-4 px-3">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
          aria-label="Go back"
        >
          <HiArrowLeft className="w-6 h-6 text-[#1B1717]" />
        </button>
        <div>
          <h1 className="text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
            PAN Service
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Request PAN creation or correction using mobile number
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Left Side - Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 w-full lg:flex-[1.6]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
                Select Action <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="new"
                    checked={action === "new"}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-4 h-4 text-[#039155] border-gray-300"
                  />
                  <span className="ml-2 text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    PAN Creation
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="correction"
                    checked={action === "correction"}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-4 h-4 text-[#039155] border-gray-300 focus:ring-[#039155] focus:ring-2"
                  />
                  <span className="ml-2 text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    PAN Correction
                  </span>
                </label>
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2"
              >
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input
                id="mobileNumber"
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  // Remove all non-digit characters and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobileNumber(value);
                  if (errors.mobileNumber) {
                    setErrors({ ...errors, mobileNumber: "" });
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={`w-full px-4 h-[48px] border rounded-lg focus:outline-none transition-colors ${errors.mobileNumber
                  ? "border-red-400 focus:border-red-500"
                  : "border-[#1B1717] border-opacity-50 focus:border-[#039155]"
                  }`}
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Action Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-[Gilroy-Semibold]">Action:</span>{" "}
                {action === "new" ? "Creation" : "Correction"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {action === "new"
                  ? "This will submit a PAN creation request for the provided mobile number."
                  : "This will submit a PAN correction request for the provided mobile number."}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 text-[16px] font-['Gilroy-Medium'] text-[#1B1717] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !mobileNumber}
                className="flex-1 px-6 py-3 text-[16px] font-['Gilroy-SemiBold'] text-white bg-[#039155] rounded-lg hover:bg-[#027a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <ButtonLoader />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Recent Requests */}
        <div className="bg-white rounded-3xl px-5 py-3 lg:flex-[1] w-full border border-gray-100 shadow-sm">
          <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
            Recent PAN Requests
          </div>

          <div>
            {recentRequests.length > 0 ? (
              recentRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="w-full text-left"
                >
                  <RecentPanRequestCard request={request} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 font-['Gilroy-Medium']">
                No recent requests found
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PanService;
