import secureLocalStorage from "react-secure-storage";
import { store } from "../redux/store";
import { logout } from "../redux/action/authAction";

export const clearAllStorage = () => {
  try {
    const knownKeys = [
      "userToken",
      "refreshToken",
      "userData",
      "loginToken",
      "permissions",
      "loginToken",
      "onboardingSteps",
      "onboardingToken",
      "companyId",
      "selectedCompany",
    ];

    // Remove all known keys
    knownKeys.forEach((key) => {
      try {
        secureLocalStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key} from secureLocalStorage:`, e);
      }
    });

    // Also clear regular localStorage items that might be related to auth
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("loginToken");
      localStorage.removeItem("onboardingSteps");
      localStorage.removeItem("onboardingToken");
      localStorage.removeItem("companyId");
      localStorage.removeItem("selectedCompany");
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }

    // Dispatch logout action to clear Redux state
    if (store && store.dispatch) {
      store.dispatch(logout());
    }

    // console.log('✅ All storage cleared due to token expiration');
  } catch (error) {
    console.error("❌ Error clearing storage:", error);
  }
};

/**
 * Checks if an error indicates token expiration
 */
export const isTokenExpiredError = (error) => {
  const httpStatus = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || "";
  const status = error?.response?.data?.status;

  return (
    httpStatus === 401 ||
    httpStatus === 403 ||
    status === "UNAUTHORIZED" ||
    status === "BAD_REQUEST" ||
    message.toLowerCase().includes("token expired") ||
    message.toLowerCase().includes("jwt expired") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("invalid token") ||
    message.toLowerCase().includes("token has expired")
  );
};
