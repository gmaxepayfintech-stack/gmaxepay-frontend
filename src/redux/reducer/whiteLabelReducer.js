import {
  WHITELABEL_CREATE_SUCCESS,
  GET_PINCODE_BY_CITY_SUCCESS,
  GET_CITY_BY_PINCODE_SUCCESS,
  GET_IP_CHECK_SUCCESS,
  GET_PANDATA_FETCH_SUCCESS,
  GET_PANDATA_FETCH_FAILURE,
  GET_WHITELABEL_LIST_SUCCESS,
  FETCH_KYC_DETAILS_SUCCESS,
  GET_KYCSTATUS_SUCCESS,
  UPDATE_KYCSTATUS_SUCCESS,
  KYC_LOCK_STATUS_SUCCESS,
  REVERT_KYC_DETAILS_SUCCESS,
  RESEND_ONBOARDING_LINK_SUCCESS,
  DEACTIVATE_ONBOARDING_LINK_SUCCESS,
  GET_COMPANY_ADMIN_SUCCESS,
  GET_COMPANY_ADMIN_FAILURE,
  GET_USER_DETAILS_SUCCESS,
  GET_USER_DETAILS_FAILURE,
  GET_REPORT_TO_USER_LIST_SUCCESS,
  GET_REPORT_TO_USER_LIST_FAILURE,
  GET_MD_DETAILS_SUCCESS,
  GET_REPORT_TO_DOWNLINE_SUCCESS,
  GET_USER_ADMIN_SUCCESS,
  FETCH_KYC_DETAILS_COMPANY_SUCCESS,
  FETCH_KYC_DETAILS_USER_SUCCESS,
  REVERT_USER_KYC_DETAILS_SUCCESS,
  CREATE_EMPLOYEE_SUCCESS,
  RESND_LOGIN_ACCESS_SUCCESS,
  EMPLOYEE_LIST_SUCCESS,
  // EMPLOYEE ACTION TYPES
  EMPLOYEE_WHITELABEL_CREATE_SUCCESS,
  EMPLOYEE_WHITELABEL_CREATE_FAILURE,
  EMPLOYEE_GET_IP_CHECK_SUCCESS,
  EMPLOYEE_GET_IP_CHECK_FAILURE,
  EMPLOYEE_GET_CITY_BY_PINCODE_SUCCESS,
  EMPLOYEE_GET_CITY_BY_PINCODE_FAILURE,
  EMPLOYEE_GET_PINCODE_BY_CITY_SUCCESS,
  EMPLOYEE_GET_PINCODE_BY_CITY_FAILURE,
  EMPLOYEE_GET_PANDATA_FETCH_SUCCESS,
  EMPLOYEE_GET_PANDATA_FETCH_FAILURE,
  EMPLOYEE_GET_WHITELABEL_LIST_SUCCESS,
  EMPLOYEE_GET_WHITELABEL_LIST_FAILURE,
  EMPLOYEE_CREATE_EMPLOYEE_SUCCESS,
  EMPLOYEE_CREATE_EMPLOYEE_FAILURE,
  EMPLOYEE_RESND_LOGIN_ACCESS_SUCCESS,
  EMPLOYEE_RESND_LOGIN_ACCESS_FAILURE,
  EMPLOYEE_FETCH_KYC_DETAILS_SUCCESS,
  EMPLOYEE_FETCH_KYC_DETAILS_FAILURE,
  EMPLOYEE_GET_KYCSTATUS_SUCCESS,
  EMPLOYEE_GET_KYCSTATUS_FAILURE,
  EMPLOYEE_UPDATE_KYCSTATUS_SUCCESS,
  EMPLOYEE_UPDATE_KYCSTATUS_FAILURE,
  EMPLOYEE_KYC_LOCK_STATUS_SUCCESS,
  EMPLOYEE_KYC_LOCK_STATUS_FAILURE,
  EMPLOYEE_REVERT_KYC_DETAILS_SUCCESS,
  EMPLOYEE_REVERT_KYC_DETAILS_FAILURE,
  EMPLOYEE_RESEND_ONBOARDING_LINK_SUCCESS,
  EMPLOYEE_RESEND_ONBOARDING_LINK_FAILURE,
  EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_SUCCESS,
  EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_FAILURE,
  EMPLOYEE_GET_COMPANY_ADMIN_SUCCESS,
  EMPLOYEE_GET_COMPANY_ADMIN_FAILURE,
  EMPLOYEE_GET_USER_DETAILS_SUCCESS,
  EMPLOYEE_GET_USER_DETAILS_FAILURE,
  EMPLOYEE_GET_REPORT_TO_USER_LIST_SUCCESS,
  EMPLOYEE_GET_REPORT_TO_USER_LIST_FAILURE,
  EMPLOYEE_GET_MD_DETAILS_SUCCESS,
  EMPLOYEE_GET_MD_DETAILS_FAILURE,
  EMPLOYEE_GET_REPORT_TO_DOWNLINE_SUCCESS,
  EMPLOYEE_GET_REPORT_TO_DOWNLINE_FAILURE,
  EMPLOYEE_GET_USER_ADMIN_SUCCESS,
  EMPLOYEE_GET_USER_ADMIN_FAILURE,
  EMPLOYEE_FETCH_KYC_DETAILS_COMPANY_SUCCESS,
  EMPLOYEE_FETCH_KYC_DETAILS_COMPANY_FAILURE,
  EMPLOYEE_FETCH_KYC_DETAILS_USER_SUCCESS,
  EMPLOYEE_FETCH_KYC_DETAILS_USER_FAILURE,
  EMPLOYEE_REVERT_USER_KYC_DETAILS_SUCCESS,
  EMPLOYEE_REVERT_USER_KYC_DETAILS_FAILURE,
  COMPANY_AEPS_STATUS_SUCCESS,
  EMPLOYEE_AEPS_STATUS_SUCCESS,
  ADMIN_AEPS_STATUS_SUCCESS,
} from "../actionType/whiteLabelAction";

const initialState = {
  loading: false,
  error: null,
  profileImage: null,
  citybyPincode: null,
  Success: null,
  message: null,
  pincodeByCity: null,
  panData: null,
  createResponse: null,
  whitelabelList: null,
  kycDetails: null,
  kycStatusClick: null,
  kycStatusCheck: null,
  kycLockStatus: null,
  kycRevert: null,
  resendOnboardingLink: null,
  deactivateOnboardingLink: null,
  companyAdmin: null,
  userDetails: null,
  reportToUserList: null,
  mdDetails: null,
  reportToDownlineList: null,
  userAdminDetails: null,
  kycDetailsCompany: null,
  kycDetailsUser: null,
  kycRevertUSer: null,
  EmployeeAdd: null,
  resendAccess: null,
  employeeList: null,
};

const whiteLabelReducer = (state = initialState, action) => {
  switch (action.type) {
    case "RESET_WHITELABEL_STATE":
      return { ...initialState };
    case WHITELABEL_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        createResponse: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };
    case GET_IP_CHECK_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        ipResponse: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };

    case GET_CITY_BY_PINCODE_SUCCESS:

      return {
        ...state,
        loading: false,
        error: action.payload,
        citybyPincode: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };

    case GET_PINCODE_BY_CITY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        pincodeByCity: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case GET_PANDATA_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        panData: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case GET_PANDATA_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        panData: null,
      };

    case GET_WHITELABEL_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        whitelabelList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }

    case EMPLOYEE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        employeeList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case CREATE_EMPLOYEE_SUCCESS:
      return {
        ...state,
        loading: false,
        EmployeeAdd: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case RESND_LOGIN_ACCESS_SUCCESS:
      return {
        ...state,
        loading: false,
        resendAccess: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case FETCH_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }

    case GET_KYCSTATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycStatusClick: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }

    case UPDATE_KYCSTATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload.message,
        Success: action.payload.status,
        kycStatusCheck: action.payload,
      }
    case KYC_LOCK_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycLockStatus: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case REVERT_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycRevert: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case RESEND_ONBOARDING_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        resendOnboardingLink: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case DEACTIVATE_ONBOARDING_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        deactivateOnboardingLink: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_COMPANY_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        companyAdmin: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_COMPANY_ADMIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case GET_USER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        userDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_USER_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case GET_REPORT_TO_USER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportToUserList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_REPORT_TO_USER_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case GET_MD_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        mdDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_REPORT_TO_DOWNLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportToDownlineList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case GET_USER_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        userAdminDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case FETCH_KYC_DETAILS_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetailsCompany: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case FETCH_KYC_DETAILS_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetailsUser: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case REVERT_USER_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycRevertUSer: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_WHITELABEL_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        createResponse: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };
    case EMPLOYEE_GET_IP_CHECK_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        ipResponse: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };
    case EMPLOYEE_GET_CITY_BY_PINCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        citybyPincode: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };
    case EMPLOYEE_GET_PINCODE_BY_CITY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        pincodeByCity: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case EMPLOYEE_GET_PANDATA_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        panData: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case EMPLOYEE_GET_PANDATA_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        panData: null,
      };
    case EMPLOYEE_GET_WHITELABEL_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        whitelabelList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_CREATE_EMPLOYEE_SUCCESS:
      return {
        ...state,
        loading: false,
        EmployeeAdd: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_RESND_LOGIN_ACCESS_SUCCESS:
      return {
        ...state,
        loading: false,
        resendAccess: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case COMPANY_AEPS_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        companyAepsStatus: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_AEPS_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        employeeAepsStatus: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
      case ADMIN_AEPS_STATUS_SUCCESS:
        return {
          ...state,
          loading: false,
          adminAepsStatus: action.payload,
          Success: action.payload.status,
          message: action.payload.message,
        }
    case EMPLOYEE_FETCH_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_KYCSTATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycStatusClick: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_UPDATE_KYCSTATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload.message,
        Success: action.payload.status,
        kycStatusCheck: action.payload,
      }
    case EMPLOYEE_KYC_LOCK_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycLockStatus: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_REVERT_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycRevert: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_RESEND_ONBOARDING_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        resendOnboardingLink: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        deactivateOnboardingLink: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_COMPANY_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        companyAdmin: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_COMPANY_ADMIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case EMPLOYEE_GET_USER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        userDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_USER_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case EMPLOYEE_GET_REPORT_TO_USER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        reportToUserList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_REPORT_TO_USER_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    case EMPLOYEE_GET_MD_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        mdDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_REPORT_TO_DOWNLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportToDownlineList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_GET_USER_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        userAdminDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_FETCH_KYC_DETAILS_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetailsCompany: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_FETCH_KYC_DETAILS_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        kycDetailsUser: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_REVERT_USER_KYC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        kycRevertUSer: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case EMPLOYEE_WHITELABEL_CREATE_FAILURE:
    case EMPLOYEE_GET_IP_CHECK_FAILURE:
    case EMPLOYEE_GET_CITY_BY_PINCODE_FAILURE:
    case EMPLOYEE_GET_PINCODE_BY_CITY_FAILURE:
    case EMPLOYEE_GET_WHITELABEL_LIST_FAILURE:
    case EMPLOYEE_CREATE_EMPLOYEE_FAILURE:
    case EMPLOYEE_RESND_LOGIN_ACCESS_FAILURE:
    case EMPLOYEE_FETCH_KYC_DETAILS_FAILURE:
    case EMPLOYEE_GET_KYCSTATUS_FAILURE:
    case EMPLOYEE_UPDATE_KYCSTATUS_FAILURE:
    case EMPLOYEE_KYC_LOCK_STATUS_FAILURE:
    case EMPLOYEE_REVERT_KYC_DETAILS_FAILURE:
    case EMPLOYEE_RESEND_ONBOARDING_LINK_FAILURE:
    case EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_FAILURE:
    case EMPLOYEE_GET_MD_DETAILS_FAILURE:
    case EMPLOYEE_GET_REPORT_TO_DOWNLINE_FAILURE:
    case EMPLOYEE_GET_USER_ADMIN_FAILURE:
    case EMPLOYEE_FETCH_KYC_DETAILS_COMPANY_FAILURE:
    case EMPLOYEE_FETCH_KYC_DETAILS_USER_FAILURE:
    case EMPLOYEE_REVERT_USER_KYC_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload?.message,
      }
    default:
      return state;
  }
};

export default whiteLabelReducer;
